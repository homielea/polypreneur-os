/**
 * Runtime leverage settings: weight overrides + the operator's pinned move.
 *
 * The config file (src/config/leverage.config.ts) is the canonical default. The
 * operator can override the weights in the UI; overrides persist in app_setting
 * and fall back to the file defaults. This keeps "weights in an editable config
 * file" true while still letting the ranking be tuned without a redeploy.
 */

import "server-only";
import {
  DEFAULT_LEVERAGE_WEIGHTS,
  LEVERAGE_COMPONENT_ORDER,
  type LeverageWeights,
} from "@/config/leverage.config";
import { getSetting, setSetting } from "@/lib/db";

const WEIGHTS_KEY = "leverage_weights";
const PINNED_KEY = "pinned_task_id";

export async function getEffectiveWeights(): Promise<LeverageWeights> {
  const override = await getSetting<Partial<LeverageWeights> | null>(
    WEIGHTS_KEY,
    null,
  );
  if (!override) return { ...DEFAULT_LEVERAGE_WEIGHTS };
  return {
    urgency: override.urgency ?? DEFAULT_LEVERAGE_WEIGHTS.urgency,
    strategic: override.strategic ?? DEFAULT_LEVERAGE_WEIGHTS.strategic,
    neglect: override.neglect ?? DEFAULT_LEVERAGE_WEIGHTS.neglect,
    judgment: override.judgment ?? DEFAULT_LEVERAGE_WEIGHTS.judgment,
    energy_fit: override.energy_fit ?? DEFAULT_LEVERAGE_WEIGHTS.energy_fit,
  };
}

export function weightsAreCustom(weights: LeverageWeights): boolean {
  return LEVERAGE_COMPONENT_ORDER.some(
    (k) => weights[k] !== DEFAULT_LEVERAGE_WEIGHTS[k],
  );
}

export async function saveWeightOverride(
  weights: LeverageWeights,
): Promise<void> {
  await setSetting(WEIGHTS_KEY, weights);
}

export async function resetWeights(): Promise<void> {
  await setSetting(WEIGHTS_KEY, null);
}

export async function getPinnedTaskId(): Promise<string | null> {
  return getSetting<string | null>(PINNED_KEY, null);
}

export async function setPinnedTaskId(taskId: string | null): Promise<void> {
  await setSetting(PINNED_KEY, taskId);
}

export const WEIGHT_SUM_TOLERANCE = 0.001;

export function weightsSum(weights: LeverageWeights): number {
  return LEVERAGE_COMPONENT_ORDER.reduce((s, k) => s + weights[k], 0);
}
