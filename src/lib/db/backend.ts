/**
 * Storage backend abstraction.
 *
 * One small interface, two implementations:
 *   - SupabaseBackend  — used when SUPABASE_* env vars are present.
 *   - JsonFileBackend  — local file store (.data/store.json), the default so the
 *                        app runs end-to-end without live Supabase.
 *
 * Datasets are single-user and tiny, so all filtering/joining is done in JS on
 * top of these four primitives. This keeps the repository layer (and the
 * leverage engine) identical across both backends.
 */

import type { DbSchema, TableName } from "@/lib/types";

export interface DbBackend {
  list<T extends TableName>(table: T): Promise<DbSchema[T][]>;
  insert<T extends TableName>(table: T, row: DbSchema[T]): Promise<DbSchema[T]>;
  update<T extends TableName>(
    table: T,
    pkValue: string,
    patch: Partial<DbSchema[T]>,
  ): Promise<DbSchema[T]>;
  remove<T extends TableName>(table: T, pkValue: string): Promise<void>;
}

/** Primary-key column for each table (everything is `id` except app_setting). */
export function pkColumn(table: TableName): string {
  return table === "app_setting" ? "key" : "id";
}
