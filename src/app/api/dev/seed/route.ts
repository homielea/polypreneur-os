import { handler } from "@/lib/api";
import { insert, list } from "@/lib/db";
import { buildSeed } from "@/lib/db/seed";
import type { TableName } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Idempotently load the seed dataset into the active backend. Mainly for
 * Supabase (the JSON backend auto-seeds on first read). Skips if data exists.
 */
export async function POST() {
  return handler(async () => {
    const existing = await list("venture");
    if (existing.length > 0) {
      return { skipped: true, reason: "ventures already present" };
    }
    const seed = buildSeed();
    const counts: Record<string, number> = {};
    for (const table of Object.keys(seed) as TableName[]) {
      const rows = seed[table];
      for (const row of rows) {
        await insert(table, row as never);
      }
      counts[table] = rows.length;
    }
    return { seeded: true, counts };
  });
}
