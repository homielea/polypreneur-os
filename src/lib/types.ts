/**
 * Polypreneur OS — v1 data model.
 *
 * Mirrors §7 of the spec exactly. The shared `date` axis on `checkin`,
 * `habit_log`, and `activity` is the load-bearing structural decision: it is
 * what makes the v2 correlation engine a query rather than a rebuild. Do not
 * remove it. Check-ins link to "ventures touched that day" by joining on `date`
 * through `activity` — there is deliberately no direct checkin→venture FK.
 */

export type VentureStatus = "primary" | "experiment" | "vault" | "dormant";

export interface Venture {
  id: string;
  name: string;
  status: VentureStatus;
  created_at: string; // ISO timestamp
}

export interface Checkin {
  id: string;
  date: string; // YYYY-MM-DD (shared axis)
  emotional_state: string;
  energy_level: number; // 1–5
  free_text: string;
  content_flag: boolean; // eligible input for the Scribe
}

export interface Habit {
  id: string;
  name: string;
  target: string; // operator-defined, free-form (e.g. "8h", "1 deep-work block")
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD (shared axis)
  value: string;
}

export type ActivityType =
  | "commit"
  | "content_shipped"
  | "calendar_time"
  | "manual";

export interface Activity {
  id: string;
  venture_id: string;
  date: string; // YYYY-MM-DD (shared axis)
  type: ActivityType;
  source: string; // e.g. "github", "notion", "manual"
  magnitude: number;
}

export type InversionTag = "execution" | "judgment";
export type TaskStatus = "todo" | "in_progress" | "done";

/**
 * `work_type` is a v1 extension beyond §7's minimum entity. It is required to
 * compute the §6.2 "energy fit" component (deep-work vs. admin against today's
 * check-in energy). Kept minimal and in the spirit of "instrument for the
 * future."
 */
export type WorkType = "deep_work" | "admin" | "creative" | "other";

export interface Task {
  id: string;
  venture_id: string;
  title: string;
  inversion_tag: InversionTag;
  status: TaskStatus;
  work_type: WorkType;
  due_date: string | null; // YYYY-MM-DD or null
  leverage_score: number | null; // refreshed snapshot; ranking always recomputes live
}

export type AgentName = "scribe" | "repurposer";
export type AgentJobStatus =
  | "pending"
  | "awaiting_approval"
  | "approved"
  | "rejected";

/**
 * Output format for an agent job. `null` for the Scribe (one canonical draft).
 * The Repurposer fans one approved piece out into several derivative formats,
 * each its own approval-gated job.
 */
export type JobFormat =
  | "short_form_script"
  | "newsletter_section"
  | "social_posts";

export interface AgentJob {
  id: string;
  agent: AgentName;
  format: JobFormat | null; // derivative format (Repurposer); null for the Scribe
  venture_id: string | null; // optional content -> venture link (project scoping)
  input_ref: string; // pointer to source (e.g. drive file id / checkin id / job:<id>)
  input_text: string; // resolved source text the agent worked from
  output: string; // the agent's draft (immutable record of what it produced)
  edited_output: string | null; // operator edits applied before approval
  status: AgentJobStatus;
  error: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type IdeaStatus = "vault" | "promoted";

export interface Idea {
  id: string;
  title: string;
  note: string;
  captured_at: string; // ISO timestamp
  status: IdeaStatus;
}

/**
 * Distribution (§ marketing). Channels are connections, not a fixed enum, so
 * routing can be per-venture and many platforms can exist as placeholders
 * (Postiz-like). `platform` is a free string; the registry in
 * src/lib/distribution/platforms.ts gives each one a label + send adapter.
 */
export type ConnectionStatus = "connected" | "placeholder" | "disabled";

export interface ChannelConnection {
  id: string;
  venture_id: string | null; // null = global (any venture)
  platform: string; // beehiiv / substack / x / linkedin / youtube / ...
  display_name: string;
  handle: string;
  status: ConnectionStatus;
  created_at: string;
}

export type PublicationStatus =
  | "scheduled"
  | "published"
  | "failed"
  | "canceled";

export interface Publication {
  id: string;
  job_id: string; // the approved agent_job being published
  channel: string; // platform string
  channel_connection_id: string | null; // which connected account (if any)
  status: PublicationStatus;
  scheduled_for: string | null; // ISO; null = publish immediately
  external_ref: string | null; // e.g. Beehiiv post id
  error: string | null;
  created_at: string;
  updated_at: string;
}

/** Named performance metric (the Analyst). Shares the date axis. */
export type MetricSource = "beehiiv" | "youtube" | "manual";

export interface Metric {
  id: string;
  venture_id: string | null; // null = account-level
  source: MetricSource;
  name: string; // subscribers / opens / clicks / views / ...
  value: number;
  date: string; // YYYY-MM-DD
  ref: string | null; // external id (post/video) for idempotent ingest
  created_at: string;
}

/** Key–value operator settings (weight overrides, agent cadence, pinned move). */
export interface AppSetting {
  key: string;
  value: string; // JSON-encoded
}

export interface DbSchema {
  venture: Venture;
  checkin: Checkin;
  habit: Habit;
  habit_log: HabitLog;
  activity: Activity;
  task: Task;
  agent_job: AgentJob;
  idea: Idea;
  publication: Publication;
  channel_connection: ChannelConnection;
  metric: Metric;
  app_setting: AppSetting;
}

export type TableName = keyof DbSchema;
