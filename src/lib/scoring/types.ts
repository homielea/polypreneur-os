import type { ActionRecord } from "@/types/domain";

export interface ScoringContext {
  now: Date;
}

/** One provider's score contribution to one action. Points are always positive — additive only. */
export interface Contribution {
  actionId: string;
  points: number;
  reason: string;
  providerId: string;
}

/**
 * Pluggable signal source for the scoring engine.
 * v1 ships manual-leverage and top20-boost; v2's Neglect Radar and
 * Reflection Pipe implement this same interface and just get registered.
 */
export interface LeverageProvider {
  id: string;
  score(actions: ActionRecord[], ctx: ScoringContext): Contribution[];
}

export interface RankedAction {
  action: ActionRecord;
  score: number;
  reasons: string[];
}

export interface CategoryTotal {
  category: string;
  points: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ScoreEventInput {
  source: string;
  category: string;
  points: number;
  actionId?: string;
}

/** Persistence boundary — Supabase in the app, in-memory in tests. */
export interface ScoreStore {
  insertEvent(event: ScoreEventInput): Promise<void>;
  totals(range: DateRange): Promise<CategoryTotal[]>;
}
