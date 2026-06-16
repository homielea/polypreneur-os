/**
 * Metric ingestion for the Analyst. Pulls named KPIs from the live sources and
 * stores them on the shared date axis. Idempotent: deduped by
 * source + name + date + ref (+ venture), so re-ingesting on the same day for the
 * same source is a no-op.
 */

import "server-only";
import { insert, list, newId, nowIso } from "@/lib/db";
import type { Metric } from "@/lib/types";
import { beehiivMetrics } from "./sources/beehiiv";

export interface IngestResult {
  collected: number;
  inserted: number;
  skippedExisting: number;
  bySource: Record<string, number>;
}

function key(m: Pick<Metric, "source" | "name" | "date" | "ref" | "venture_id">) {
  return [m.source, m.name, m.date, m.ref ?? "", m.venture_id ?? ""].join("|");
}

export async function ingestMetrics(): Promise<IngestResult> {
  const raw = await beehiivMetrics().catch(() => []);

  const existing = await list("metric");
  const seen = new Set(existing.map(key));

  let inserted = 0;
  let skippedExisting = 0;
  const bySource: Record<string, number> = {};

  for (const m of raw) {
    if (seen.has(key(m))) {
      skippedExisting++;
      continue;
    }
    seen.add(key(m));
    const metric: Metric = { id: newId(), created_at: nowIso(), ...m };
    await insert("metric", metric);
    inserted++;
    bySource[m.source] = (bySource[m.source] ?? 0) + 1;
  }

  return { collected: raw.length, inserted, skippedExisting, bySource };
}
