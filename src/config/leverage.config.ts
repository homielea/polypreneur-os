/**
 * Leverage-score configuration — §6.2 of the spec.
 *
 * THIS FILE IS THE CANONICAL, OPERATOR-OWNED SOURCE OF THE WEIGHTS.
 * Edit the numbers here to retune the home-screen ranking. The five weights
 * MUST sum to 1.0. The UI surfaces both the final score and the per-component
 * breakdown, and lets the operator override these defaults at runtime (stored
 * in `app_setting`); a runtime override falls back to the values defined here.
 *
 * The formula (do not change without changing the spec):
 *   leverage = (0.30·urgency + 0.25·strategic + 0.20·neglect
 *               + 0.15·judgment + 0.10·energy_fit) × 100
 */

export type LeverageComponentKey =
  | "urgency"
  | "strategic"
  | "neglect"
  | "judgment"
  | "energy_fit";

export interface LeverageComponentDef {
  key: LeverageComponentKey;
  label: string;
  weight: number;
  measures: string;
}

export const LEVERAGE_COMPONENTS: Record<
  LeverageComponentKey,
  LeverageComponentDef
> = {
  urgency: {
    key: "urgency",
    label: "Deadline urgency",
    weight: 0.3,
    measures:
      "1.0 if due today/overdue, decaying linearly to 0 over ~14 days",
  },
  strategic: {
    key: "strategic",
    label: "Strategic weight",
    weight: 0.25,
    measures: "primary venture = 1.0, experiment = 0.5; vault/dormant excluded",
  },
  neglect: {
    key: "neglect",
    label: "Neglect",
    weight: 0.2,
    measures: "days since last activity, normalized (0 days → 0; 14+ days → 1.0)",
  },
  judgment: {
    key: "judgment",
    label: "Judgment bonus",
    weight: 0.15,
    measures: "1.0 if task tagged judgment, 0 if execution",
  },
  energy_fit: {
    key: "energy_fit",
    label: "Energy fit",
    weight: 0.1,
    measures:
      "match between task type and today's check-in energy (deep-work high on high-energy days; admin high on low-energy days)",
  },
};

export const LEVERAGE_COMPONENT_ORDER: LeverageComponentKey[] = [
  "urgency",
  "strategic",
  "neglect",
  "judgment",
  "energy_fit",
];

export type LeverageWeights = Record<LeverageComponentKey, number>;

export const DEFAULT_LEVERAGE_WEIGHTS: LeverageWeights = {
  urgency: LEVERAGE_COMPONENTS.urgency.weight,
  strategic: LEVERAGE_COMPONENTS.strategic.weight,
  neglect: LEVERAGE_COMPONENTS.neglect.weight,
  judgment: LEVERAGE_COMPONENTS.judgment.weight,
  energy_fit: LEVERAGE_COMPONENTS.energy_fit.weight,
};

/** Decay horizon (days) for deadline urgency and neglect normalization. */
export const URGENCY_HORIZON_DAYS = 14;
export const NEGLECT_HORIZON_DAYS = 14;

/**
 * Score (0–100) at or above which an EXECUTION-tagged task is surfaced with a
 * "delegate to an agent" nudge instead of being promoted as the operator's own
 * move — keeping the human in the judgment layer (§6.2).
 */
export const DELEGATE_NUDGE_THRESHOLD = 50;
