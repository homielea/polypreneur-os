/**
 * Supabase (Postgres) backend. Active when SUPABASE_* env vars are present.
 * The table/column names match the §7 migrations exactly.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { DbSchema, TableName } from "@/lib/types";
import { type DbBackend, pkColumn } from "./backend";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export class SupabaseBackend implements DbBackend {
  async list<T extends TableName>(table: T): Promise<DbSchema[T][]> {
    const { data, error } = await getClient().from(table).select("*");
    if (error) throw new Error(`[supabase] list ${table}: ${error.message}`);
    return (data ?? []) as DbSchema[T][];
  }

  async insert<T extends TableName>(
    table: T,
    row: DbSchema[T],
  ): Promise<DbSchema[T]> {
    const { data, error } = await getClient()
      .from(table)
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(`[supabase] insert ${table}: ${error.message}`);
    return data as DbSchema[T];
  }

  async update<T extends TableName>(
    table: T,
    pkValue: string,
    patch: Partial<DbSchema[T]>,
  ): Promise<DbSchema[T]> {
    const { data, error } = await getClient()
      .from(table)
      .update(patch as never)
      .eq(pkColumn(table), pkValue)
      .select()
      .single();
    if (error) throw new Error(`[supabase] update ${table}: ${error.message}`);
    return data as DbSchema[T];
  }

  async remove<T extends TableName>(table: T, pkValue: string): Promise<void> {
    const { error } = await getClient()
      .from(table)
      .delete()
      .eq(pkColumn(table), pkValue);
    if (error) throw new Error(`[supabase] remove ${table}: ${error.message}`);
  }
}
