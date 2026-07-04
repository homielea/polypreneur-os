import type { ActionRecord } from "@/types/domain";
import type {
  CategoryTotal,
  Contribution,
  DateRange,
  LeverageProvider,
  RankedAction,
  ScoreEventInput,
  ScoreStore,
  ScoringContext,
} from "./types";

/**
 * Additive scoring engine. Framework-agnostic: no React, no Supabase imports —
 * persistence is injected via ScoreStore so other features (and v2 providers)
 * can call it as a plain service.
 */
export class ScoringEngine {
  private providers = new Map<string, LeverageProvider>();

  constructor(private store: ScoreStore) {}

  registerProvider(provider: LeverageProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Rank actions by summed provider contributions, highest first.
   * Ties break by created_at ascending (older work surfaces first).
   * Reasons are kept so the UI can show *why* something ranks where it does.
   */
  rank(actions: ActionRecord[], ctx: ScoringContext): RankedAction[] {
    const byAction = new Map<string, Contribution[]>();
    for (const provider of this.providers.values()) {
      for (const c of provider.score(actions, ctx)) {
        if (c.points <= 0) continue; // additive only — never let a provider subtract
        const list = byAction.get(c.actionId) ?? [];
        list.push(c);
        byAction.set(c.actionId, list);
      }
    }
    return actions
      .map((action) => {
        const contributions = byAction.get(action.id) ?? [];
        return {
          action,
          score: contributions.reduce((sum, c) => sum + c.points, 0),
          reasons: contributions.map((c) => c.reason),
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(a.action.created_at).getTime() - new Date(b.action.created_at).getTime(),
      );
  }

  /** Persist an additive score event. Rejects non-positive points. */
  async recordEvent(event: ScoreEventInput): Promise<void> {
    if (!Number.isFinite(event.points) || event.points <= 0) {
      throw new Error(`Score events must have positive points, got ${event.points}`);
    }
    await this.store.insertEvent(event);
  }

  /** Accumulated points per category over a range. Display-only; never compared to a target. */
  totals(range: DateRange): Promise<CategoryTotal[]> {
    return this.store.totals(range);
  }
}
