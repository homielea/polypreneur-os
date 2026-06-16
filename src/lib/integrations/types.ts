/**
 * Read-integration contracts. v1 reads from existing tools and projects their
 * signals onto the §7 `activity` table (so they feed neglect scoring and the
 * home screen) — "read, don't replace" (§3.4). Each adapter is env-gated and
 * returns [] when unconfigured.
 */

import type { ActivityType } from "@/lib/types";

export interface ExternalSignal {
  /** Stable provider:id used as activity.source for idempotent imports. */
  sourceId: string;
  provider: "github" | "google_calendar" | "notion";
  type: ActivityType;
  title: string;
  date: string; // YYYY-MM-DD
  magnitude: number;
  /** Free-text hint (repo, event title, page title) used to match a venture. */
  ventureHint: string;
}

export interface IntegrationStatus {
  key: string;
  label: string;
  mode: "live" | "stubbed";
  configured: boolean;
  note: string;
}
