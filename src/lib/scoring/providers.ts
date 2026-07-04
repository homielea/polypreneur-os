import type { LeverageProvider } from "./types";

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
