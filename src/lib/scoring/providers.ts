import type { Contribution, LeverageProvider } from "./types";

/** The user's own 1–5 leverage rating is the primary ranking signal in v1. */
export const manualLeverage: LeverageProvider = {
  id: "manual-leverage",
  score: (actions) =>
    actions.map((a) => ({
      actionId: a.id,
      points: a.leverage * 10,
      reason: `leverage ${a.leverage}/5`,
      providerId: "manual-leverage",
    })),
};

/** How far back the app fetches score events when building `categoryActivity`. */
export const ACTIVITY_LOOKBACK_DAYS = 60;

/** Quiet thresholds (days without gathered points) and their additive boosts. */
export const NEGLECT_QUIET_AFTER_DAYS = 7;
export const NEGLECT_VERY_QUIET_AFTER_DAYS = 14;
export const NEGLECT_BOOSTS = { quiet: 10, veryQuiet: 20 } as const;

const DAY_MS = 86_400_000;

/**
 * Neglect Radar (v2): gently surfaces ventures that stopped gathering points.
 * A category quiet for a week gets a modest additive boost on all its open
 * actions; two weeks gets a bigger one. The boost nudges — it never outranks a
 * clearly higher-leverage action, and there is no penalty side (additive only,
 * per the anti-gamification stance).
 *
 * Categories with no recorded points at all are anchored to their oldest open
 * action, so a brand-new venture isn't "neglected" on day one.
 */
export const neglectRadar: LeverageProvider = {
  id: "neglect-radar",
  score: (actions, ctx) => {
    const activity = ctx.categoryActivity;
    if (!activity) return []; // data not loaded — stay silent rather than guess

    const oldestOpenByCategory = new Map<string, string>();
    for (const a of actions) {
      const current = oldestOpenByCategory.get(a.category);
      if (!current || a.created_at < current) oldestOpenByCategory.set(a.category, a.created_at);
    }

    const contributions: Contribution[] = [];
    for (const action of actions) {
      const anchor = activity[action.category] ?? oldestOpenByCategory.get(action.category);
      if (!anchor) continue;
      const daysQuiet = Math.floor((ctx.now.getTime() - new Date(anchor).getTime()) / DAY_MS);
      if (daysQuiet < NEGLECT_QUIET_AFTER_DAYS) continue;
      contributions.push({
        actionId: action.id,
        points:
          daysQuiet >= NEGLECT_VERY_QUIET_AFTER_DAYS
            ? NEGLECT_BOOSTS.veryQuiet
            : NEGLECT_BOOSTS.quiet,
        reason: `${action.category} quiet for ${daysQuiet} days`,
        providerId: "neglect-radar",
      });
    }
    return contributions;
  },
};

/** Actions promoted from a top-20% idea triage carry a standing boost. */
export const top20Boost: LeverageProvider = {
  id: "top20-boost",
  score: (actions) =>
    actions
      .filter((a) => a.source === "idea_promotion")
      .map((a) => ({
        actionId: a.id,
        points: 15,
        reason: "came through 80/20 triage",
        providerId: "top20-boost",
      })),
};
