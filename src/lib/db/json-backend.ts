/**
 * Local JSON-file backend. The default store when Supabase is not configured,
 * so the cockpit is fully runnable for review. Persists to .data/store.json.
 *
 * Server-only (uses node:fs). A process-level mutex serializes writes so
 * concurrent route handlers don't clobber the file.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { DbSchema, TableName } from "@/lib/types";
import { type DbBackend, pkColumn } from "./backend";
import { buildSeed } from "./seed";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

type Store = { [K in TableName]: DbSchema[K][] };

let writeChain: Promise<unknown> = Promise.resolve();

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const seeded = buildSeed();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

/** Serialize a read-modify-write so concurrent requests stay consistent. */
function withStore<R>(fn: (store: Store) => Promise<R> | R): Promise<R> {
  const next = writeChain.then(async () => {
    const store = await readStore();
    const result = await fn(store);
    return result;
  });
  // keep the chain alive but don't let rejections break future writes
  writeChain = next.catch(() => undefined);
  return next;
}

export class JsonFileBackend implements DbBackend {
  async list<T extends TableName>(table: T): Promise<DbSchema[T][]> {
    return withStore(
      (store) => [...((store[table] ?? []) as DbSchema[T][])] as DbSchema[T][],
    );
  }

  async insert<T extends TableName>(
    table: T,
    row: DbSchema[T],
  ): Promise<DbSchema[T]> {
    return withStore(async (store) => {
      const rows = (store[table] ?? []) as DbSchema[T][];
      rows.push(row);
      store[table] = rows as Store[T];
      await writeStore(store);
      return row;
    });
  }

  async update<T extends TableName>(
    table: T,
    pkValue: string,
    patch: Partial<DbSchema[T]>,
  ): Promise<DbSchema[T]> {
    const pk = pkColumn(table);
    return withStore(async (store) => {
      const rows = (store[table] ?? []) as unknown as Record<string, unknown>[];
      const idx = rows.findIndex((r) => r[pk] === pkValue);
      if (idx === -1) throw new Error(`${table} ${pkValue} not found`);
      rows[idx] = { ...rows[idx], ...patch };
      store[table] = rows as unknown as Store[T];
      await writeStore(store);
      return rows[idx] as unknown as DbSchema[T];
    });
  }

  async remove<T extends TableName>(table: T, pkValue: string): Promise<void> {
    const pk = pkColumn(table);
    return withStore(async (store) => {
      const rows = (store[table] ?? []) as unknown as Record<string, unknown>[];
      store[table] = rows.filter((r) => r[pk] !== pkValue) as unknown as Store[T];
      await writeStore(store);
    });
  }
}
