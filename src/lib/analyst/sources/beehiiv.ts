/**
 * Beehiiv metrics reader (the Analyst's data source for the newsletter).
 * Env-gated by BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID; returns [] when off.
 *
 * Best-effort, like the publish adapter — Beehiiv's stats shape varies by plan.
 * Subscribers are recorded account-level (venture_id null); attributing them to
 * a specific venture is a config follow-up.
 */

import "server-only";
import { env, hasBeehiiv } from "@/lib/env";
import { today } from "@/lib/db";
import type { Metric, MetricSource } from "@/lib/types";

type RawMetric = Omit<Metric, "id" | "created_at">;

export async function beehiivMetrics(): Promise<RawMetric[]> {
  if (!hasBeehiiv) return [];

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${env.beehiivPublicationId}?expand[]=stats`,
    { headers: { authorization: `Bearer ${env.beehiivApiKey}` } },
  );
  if (!res.ok) {
    throw new Error(`Beehiiv stats ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = (await res.json().catch(() => ({}))) as {
    data?: { stats?: { active_subscriptions?: number } };
  };
  const subs = data.data?.stats?.active_subscriptions;
  if (typeof subs !== "number") return [];

  const source: MetricSource = "beehiiv";
  return [
    {
      venture_id: null,
      source,
      name: "subscribers",
      value: subs,
      date: today(),
      ref: null,
    },
  ];
}
