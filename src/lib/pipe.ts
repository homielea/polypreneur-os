import { format } from "date-fns";
import type { LedgerEntry } from "@/types/domain";

/**
 * Reflection → Content Pipe (v2): tagged ledger entries are raw material for
 * newsletters and scripts. Pure helpers — no React, no Supabase — so the
 * scoring provider and the Pipe page share one definition of "material".
 */

/** How recent a judgment has to be to count as fresh material. */
export const MATERIAL_WINDOW_DAYS = 30;

/** Fresh entries per tag before a theme reads as "ready to draft". */
export const MATERIAL_READY_THRESHOLD = 3;

const DAY_MS = 86_400_000;

export interface TagGroup {
  tag: string;
  /** All entries carrying the tag, newest first. */
  entries: LedgerEntry[];
  /** Entries inside the material window. */
  recentCount: number;
}

const isRecent = (entry: LedgerEntry, now: Date) =>
  now.getTime() - new Date(entry.created_at).getTime() <= MATERIAL_WINDOW_DAYS * DAY_MS;

/** Group entries under each of their tags; richest fresh material first. */
export function groupByTag(entries: LedgerEntry[], now: Date): TagGroup[] {
  const byTag = new Map<string, LedgerEntry[]>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      const list = byTag.get(tag) ?? [];
      list.push(entry);
      byTag.set(tag, list);
    }
  }
  return [...byTag.entries()]
    .map(([tag, tagged]) => ({
      tag,
      entries: [...tagged].sort((a, b) => b.created_at.localeCompare(a.created_at)),
      recentCount: tagged.filter((e) => isRecent(e, now)).length,
    }))
    .sort(
      (a, b) =>
        b.recentCount - a.recentCount ||
        b.entries.length - a.entries.length ||
        a.tag.localeCompare(b.tag),
    );
}

/** Fresh-material counts per tag — the reflection-pipe provider's input. */
export function reflectionMaterial(entries: LedgerEntry[], now: Date): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    if (!isRecent(entry, now)) continue;
    for (const tag of entry.tags) counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return counts;
}

/** Markdown digest of one tag's entries, ready to paste into a draft. */
export function formatDigest(tag: string, entries: LedgerEntry[]): string {
  const sections = entries.map((entry) => {
    const lines = [`## ${format(new Date(entry.created_at), "MMM d, yyyy")}`];
    if (entry.situation) lines.push(`**Situation:** ${entry.situation}`);
    if (entry.judgment) lines.push(`**Judgment:** ${entry.judgment}`);
    if (entry.outcome) lines.push(`**Outcome:** ${entry.outcome}`);
    return lines.join("\n\n");
  });
  return [`# ${tag} — judgment log`, ...sections].join("\n\n");
}
