// Domain types mirroring supabase/migrations/0001_init.sql.
// Hand-maintained for v1 (no codegen against a live project yet).

export type ActionStatus = "open" | "done";
export type ActionSource = "manual" | "idea_promotion";

export interface ActionRecord {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  category: string;
  leverage: number; // 1–5, user-assigned
  status: ActionStatus;
  source: ActionSource;
  created_at: string;
  completed_at: string | null;
}

export interface ScoreEvent {
  id: string;
  user_id: string;
  action_id: string | null;
  source: string;
  category: string;
  points: number; // always > 0 — additive by construction
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  situation: string;
  judgment: string;
  outcome: string;
  tags: string[];
  created_at: string;
}

export type IdeaTriage = "now" | "vault";
export type IdeaStatus = "active" | "promoted" | "archived";

export interface Idea {
  id: string;
  user_id: string;
  content: string;
  triage: IdeaTriage;
  status: IdeaStatus;
  promoted_action_id: string | null;
  next_resurface_at: string | null;
  created_at: string;
}
