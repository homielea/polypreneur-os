/**
 * The Analyst's transparent compute. It does not act — it surfaces signals for
 * the operator to judge (consistent with the no-black-box / judgment-stays-human
 * principles). Everything here is rule-based and inspectable; this is NOT the
 * inner-state correlation engine (that needs ~3 months of data — still v2+).
 *
 * Signals:
 *  - momentum: activity in the last 7 days vs the prior 7 days, per venture.
 *  - neglect radar: active ventures sorted by staleness; "going cold" flag.
 *  - performance: latest value + delta for each named metric.
 */

import "server-only";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { list, today } from "@/lib/db";
import type { Activity, Metric } from "@/lib/types";
import type {
  AnalystPayload,
  MetricSignal,
  Trend,
  VentureSignal,
} from "./types";

export type { AnalystPayload } from "./types";

/** Days without activity before an active venture is flagged "going cold". */
export const COLD_THRESHOLD_DAYS = 7;

function sumWindow(
  activities: Activity[],
  todayStr: string,
  fromDaysAgo: number,
  toDaysAgo: number,
): number {
  return activities.reduce((sum, a) => {
    const age = differenceInCalendarDays(parseISO(todayStr), parseISO(a.date));
    return age >= toDaysAgo && age < fromDaysAgo ? sum + a.magnitude : sum;
  }, 0);
}

function trendOf(recent: number, prior: number): Trend {
  if (recent > prior) return "rising";
  if (recent < prior) return "falling";
  return "flat";
}

export async function buildAnalysis(): Promise<AnalystPayload> {
  const [ventures, activities, metrics] = await Promise.all([
    list("venture"),
    list("activity"),
    list("metric"),
  ]);
  const day = today();

  const byVenture = new Map<string, Activity[]>();
  for (const a of activities) {
    const arr = byVenture.get(a.venture_id) ?? [];
    arr.push(a);
    byVenture.set(a.venture_id, arr);
  }

  const signals: VentureSignal[] = [];
  for (const v of ventures) {
    if (v.status === "vault" || v.status === "dormant") continue;
    const acts = byVenture.get(v.id) ?? [];
    const latest = acts.reduce<string | null>(
      (max, a) => (max === null || a.date > max ? a.date : max),
      null,
    );
    const daysSinceActivity =
      latest === null
        ? null
        : Math.max(0, differenceInCalendarDays(parseISO(day), parseISO(latest)));
    const recent = sumWindow(acts, day, 7, 0);
    const prior = sumWindow(acts, day, 14, 7);
    signals.push({
      ventureId: v.id,
      name: v.name,
      status: v.status,
      daysSinceActivity,
      recent,
      prior,
      trend: trendOf(recent, prior),
      cold:
        daysSinceActivity === null || daysSinceActivity >= COLD_THRESHOLD_DAYS,
    });
  }

  signals.sort(
    (a, b) => (b.daysSinceActivity ?? 999) - (a.daysSinceActivity ?? 999),
  );

  // Per-metric latest + delta vs the previous reading.
  const metricGroups = new Map<string, Metric[]>();
  for (const m of metrics) {
    const k = `${m.source}:${m.name}`;
    const arr = metricGroups.get(k) ?? [];
    arr.push(m);
    metricGroups.set(k, arr);
  }
  const metricSignals: MetricSignal[] = [];
  for (const [, group] of metricGroups) {
    group.sort((a, b) => a.date.localeCompare(b.date));
    const latest = group[group.length - 1];
    const previous = group.length > 1 ? group[group.length - 2] : null;
    metricSignals.push({
      name: latest.name,
      source: latest.source,
      latest: latest.value,
      previous: previous ? previous.value : null,
      delta: previous ? latest.value - previous.value : null,
      date: latest.date,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    ventures: signals,
    cold: signals.filter((s) => s.cold),
    metrics: metricSignals,
  };
}
