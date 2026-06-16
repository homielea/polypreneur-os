/**
 * Pull signals from the live read integrations and project them onto the
 * `activity` table, mapped to ventures by name. Idempotent: an activity is keyed
 * by the signal's stable sourceId, so re-syncing never double-counts.
 *
 * Unmatched signals (no venture name matches the hint) are reported, not
 * imported — the operator stays in control of what counts as venture activity.
 */

import "server-only";
import { insert, list, newId } from "@/lib/db";
import type { Activity, Venture } from "@/lib/types";
import { calendarSignals } from "./gcal";
import { githubSignals } from "./github";
import { notionSignals } from "./notion";
import type { ExternalSignal } from "./types";

function matchVenture(hint: string, ventures: Venture[]): Venture | null {
  const h = hint.toLowerCase();
  for (const v of ventures) {
    const n = v.name.toLowerCase();
    if (n && (h.includes(n) || n.includes(h))) return v;
  }
  return null;
}

export interface SyncResult {
  collected: number;
  imported: number;
  skippedExisting: number;
  unmatched: number;
  byProvider: Record<string, number>;
}

export async function syncIntegrations(): Promise<SyncResult> {
  const [gh, gc, no] = await Promise.all([
    githubSignals().catch(() => [] as ExternalSignal[]),
    calendarSignals().catch(() => [] as ExternalSignal[]),
    notionSignals().catch(() => [] as ExternalSignal[]),
  ]);
  const signals = [...gh, ...gc, ...no];

  const ventures = await list("venture");
  const existing = await list("activity");
  const seenSources = new Set(existing.map((a) => a.source));

  const byProvider: Record<string, number> = {};
  let imported = 0;
  let skippedExisting = 0;
  let unmatched = 0;

  for (const sig of signals) {
    if (seenSources.has(sig.sourceId)) {
      skippedExisting++;
      continue;
    }
    const venture = matchVenture(sig.ventureHint, ventures);
    if (!venture) {
      unmatched++;
      continue;
    }
    const activity: Activity = {
      id: newId(),
      venture_id: venture.id,
      date: sig.date,
      type: sig.type,
      source: sig.sourceId,
      magnitude: sig.magnitude,
    };
    await insert("activity", activity);
    seenSources.add(sig.sourceId);
    imported++;
    byProvider[sig.provider] = (byProvider[sig.provider] ?? 0) + 1;
  }

  return {
    collected: signals.length,
    imported,
    skippedExisting,
    unmatched,
    byProvider,
  };
}
