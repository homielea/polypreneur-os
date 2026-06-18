/**
 * Repository layer. Route handlers import from here, never from a specific
 * backend. Picks Supabase when configured, otherwise the local JSON store.
 */

import "server-only";
import { randomUUID } from "node:crypto";
import { hasSupabase } from "@/lib/env";
import type { AppSetting, DbSchema, TableName } from "@/lib/types";
import type { DbBackend } from "./backend";
import { JsonFileBackend } from "./json-backend";
import { SupabaseBackend } from "./supabase-backend";

let backend: DbBackend | null = null;

export function db(): DbBackend {
  if (!backend) {
    backend = hasSupabase ? new SupabaseBackend() : new JsonFileBackend();
  }
  return backend;
}

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Today's date on the shared YYYY-MM-DD axis (UTC). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- generic helpers -------------------------------------------------------

export function list<T extends TableName>(table: T): Promise<DbSchema[T][]> {
  return db().list(table);
}

export function insert<T extends TableName>(
  table: T,
  row: DbSchema[T],
): Promise<DbSchema[T]> {
  return db().insert(table, row);
}

export function update<T extends TableName>(
  table: T,
  pk: string,
  patch: Partial<DbSchema[T]>,
): Promise<DbSchema[T]> {
  return db().update(table, pk, patch);
}

export function remove<T extends TableName>(
  table: T,
  pk: string,
): Promise<void> {
  return db().remove(table, pk);
}

// ---- app settings ----------------------------------------------------------

export async function getSetting<T>(
  key: string,
  fallback: T,
): Promise<T> {
  const rows = await list("app_setting");
  const row = rows.find((r) => r.key === key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const encoded = JSON.stringify(value);
  const rows = await list("app_setting");
  const existing = rows.find((r) => r.key === key);
  if (existing) {
    await update("app_setting", key, { value: encoded } as Partial<AppSetting>);
  } else {
    await insert("app_setting", { key, value: encoded });
  }
}
