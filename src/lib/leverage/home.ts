/**
 * Assembles the home-screen payload: the single highest-leverage move, runners-
 * up, and the execution items the operator should delegate rather than do.
 *
 * Selection rule (§6.2 / §2):
 *   - The HERO ("your highest-leverage move") is the operator's own move. High-
 *     scoring EXECUTION items are NOT promoted as the hero — they get a
 *     "delegate to an agent" nudge instead, keeping the human in the judgment
 *     layer. So the hero is the top JUDGMENT-tagged task (falling back to the
 *     top task overall only if nothing is judgment-tagged).
 *   - The operator can OVERRIDE the hero by pinning any task. No black box.
 */

import "server-only";
import { list, today } from "@/lib/db";
import { rankTasks, type RankedTask } from "@/lib/leverage/score";
import {
  getEffectiveWeights,
  getPinnedTaskId,
  weightsAreCustom,
} from "@/lib/leverage/settings";
import type { HomePayload } from "@/lib/leverage/home-types";

export type { HomePayload };

export async function buildHome(): Promise<HomePayload> {
  const [tasks, ventures, activities, checkins] = await Promise.all([
    list("task"),
    list("venture"),
    list("activity"),
    list("checkin"),
  ]);

  const day = today();
  const todayCheckin = checkins.find((c) => c.date === day) ?? null;
  const weights = await getEffectiveWeights();
  const pinnedTaskId = await getPinnedTaskId();

  const ranked = rankTasks(tasks, ventures, activities, todayCheckin, day, weights);

  const judgmentRanked = ranked.filter(
    (r) => r.task.inversion_tag === "judgment",
  );
  const delegate = ranked.filter((r) => r.result.suggestDelegate);

  let hero: RankedTask | null = null;
  let heroIsOverride = false;
  let heroFallbackToExecution = false;

  if (pinnedTaskId) {
    hero = ranked.find((r) => r.task.id === pinnedTaskId) ?? null;
    heroIsOverride = hero !== null;
  }
  if (!hero) {
    if (judgmentRanked.length > 0) {
      hero = judgmentRanked[0];
    } else if (ranked.length > 0) {
      hero = ranked[0];
      heroFallbackToExecution = true;
    }
  }

  const runnersUp = ranked
    .filter((r) => r.task.id !== hero?.task.id)
    .slice(0, 3);

  return {
    today: day,
    hasCheckinToday: todayCheckin !== null,
    weights,
    weightsCustomized: weightsAreCustom(weights),
    pinnedTaskId,
    hero,
    heroIsOverride,
    heroFallbackToExecution,
    runnersUp,
    delegate,
    ranked,
  };
}
