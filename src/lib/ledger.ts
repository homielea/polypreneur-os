/**
 * The Great Inversion Ledger (§6.1): the execution-vs-judgment ratio across
 * open work, with a trend recorded over time.
 *
 * v1 has no historical task snapshots, so the ledger records one ratio snapshot
 * per day (in app_setting) as the operator uses the app — "instrument for the
 * future" in concrete form. The trend grows organically with daily usage.
 */

import "server-only";
import { getSetting, list, setSetting, today } from "@/lib/db";

export interface LedgerCounts {
  execution: number;
  judgment: number;
  total: number;
  judgmentShare: number; // 0–1
}

export interface LedgerSnapshot {
  date: string;
  execution: number;
  judgment: number;
}

export interface LedgerPayload {
  counts: LedgerCounts;
  history: LedgerSnapshot[];
}

const SNAPSHOT_KEY = "ledger_snapshots";
const MAX_SNAPSHOTS = 120;

export async function buildLedger(): Promise<LedgerPayload> {
  const tasks = await list("task");
  const open = tasks.filter((t) => t.status !== "done");
  const execution = open.filter((t) => t.inversion_tag === "execution").length;
  const judgment = open.filter((t) => t.inversion_tag === "judgment").length;
  const total = execution + judgment;
  const counts: LedgerCounts = {
    execution,
    judgment,
    total,
    judgmentShare: total === 0 ? 0 : judgment / total,
  };

  // Upsert today's snapshot for the trend.
  const day = today();
  const history = await getSetting<LedgerSnapshot[]>(SNAPSHOT_KEY, []);
  const idx = history.findIndex((s) => s.date === day);
  const snapshot: LedgerSnapshot = { date: day, execution, judgment };
  if (idx === -1) history.push(snapshot);
  else history[idx] = snapshot;
  history.sort((a, b) => a.date.localeCompare(b.date));
  const trimmed = history.slice(-MAX_SNAPSHOTS);
  await setSetting(SNAPSHOT_KEY, trimmed);

  return { counts, history: trimmed };
}
