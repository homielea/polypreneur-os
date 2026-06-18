/**
 * Leverage scoring engine — the exact §6.2 additive model.
 *
 * Pure and deterministic: given a task, its venture, that venture's activity
 * history, and today's check-in, it returns the final 0–100 score AND the
 * per-component breakdown so the ranking is always inspectable. No black box.
 */

import { differenceInCalendarDays, parseISO } from "date-fns";
import {
  DEFAULT_LEVERAGE_WEIGHTS,
  DELEGATE_NUDGE_THRESHOLD,
  LEVERAGE_COMPONENTS,
  LEVERAGE_COMPONENT_ORDER,
  NEGLECT_HORIZON_DAYS,
  URGENCY_HORIZON_DAYS,
  type LeverageComponentKey,
  type LeverageWeights,
} from "@/config/leverage.config";
import type { Activity, Checkin, Task, Venture } from "@/lib/types";

export interface ComponentResult {
  key: LeverageComponentKey;
  label: string;
  value: number; // normalized 0–1
  weight: number;
  contribution: number; // value × weight × 100 (points added to the total)
  explanation: string;
}

export interface LeverageResult {
  taskId: string;
  total: number; // 0–100
  components: ComponentResult[];
  /** True when an execution-tagged task scores high enough to delegate. */
  suggestDelegate: boolean;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Deadline urgency: 1.0 due today/overdue → linear decay to 0 over the horizon. */
export function urgencyValue(
  dueDate: string | null,
  today: string,
): { value: number; explanation: string } {
  if (!dueDate) return { value: 0, explanation: "no due date" };
  const days = differenceInCalendarDays(parseISO(dueDate), parseISO(today));
  if (days <= 0) {
    return { value: 1, explanation: days < 0 ? `overdue by ${-days}d` : "due today" };
  }
  if (days >= URGENCY_HORIZON_DAYS) {
    return { value: 0, explanation: `due in ${days}d (beyond ${URGENCY_HORIZON_DAYS}d)` };
  }
  const value = clamp01(1 - days / URGENCY_HORIZON_DAYS);
  return { value, explanation: `due in ${days}d` };
}

/** Strategic weight: primary = 1.0, experiment = 0.5. vault/dormant are excluded upstream. */
export function strategicValue(venture: Venture): {
  value: number;
  explanation: string;
} {
  switch (venture.status) {
    case "primary":
      return { value: 1, explanation: "primary venture" };
    case "experiment":
      return { value: 0.5, explanation: "experiment venture" };
    default:
      return { value: 0, explanation: `${venture.status} (excluded from ranking)` };
  }
}

/** Neglect: days since last activity for the venture, 0d → 0, ≥horizon → 1.0. */
export function neglectValue(
  ventureActivities: Activity[],
  today: string,
): { value: number; explanation: string } {
  if (ventureActivities.length === 0) {
    return { value: 1, explanation: "no activity ever logged" };
  }
  const latest = ventureActivities.reduce((max, a) =>
    a.date > max.date ? a : max,
  );
  const days = Math.max(
    0,
    differenceInCalendarDays(parseISO(today), parseISO(latest.date)),
  );
  const value = clamp01(days / NEGLECT_HORIZON_DAYS);
  return { value, explanation: `${days}d since last activity` };
}

/** Judgment bonus: 1.0 if tagged judgment, 0 if execution. */
export function judgmentValue(task: Task): {
  value: number;
  explanation: string;
} {
  return task.inversion_tag === "judgment"
    ? { value: 1, explanation: "judgment-tagged" }
    : { value: 0, explanation: "execution-tagged" };
}

/**
 * Energy fit: match between task work type and today's check-in energy.
 * deep-work/creative score high on high-energy days; admin scores high on
 * low-energy days. With no check-in today, energy is unknown → neutral 0.5.
 */
export function energyFitValue(
  task: Task,
  todayCheckin: Checkin | null,
): { value: number; explanation: string } {
  if (!todayCheckin) {
    return { value: 0.5, explanation: "no check-in today (neutral)" };
  }
  const e = clamp01((todayCheckin.energy_level - 1) / 4); // 1–5 → 0–1
  switch (task.work_type) {
    case "deep_work":
    case "creative":
      return {
        value: e,
        explanation: `deep/creative work, energy ${todayCheckin.energy_level}/5`,
      };
    case "admin":
      return {
        value: clamp01(1 - e),
        explanation: `admin work, energy ${todayCheckin.energy_level}/5`,
      };
    default:
      return { value: 0.5, explanation: "untyped work (neutral)" };
  }
}

export interface ScoreInputs {
  task: Task;
  venture: Venture;
  ventureActivities: Activity[];
  todayCheckin: Checkin | null;
  today: string; // YYYY-MM-DD
  weights?: LeverageWeights;
}

export function computeLeverage({
  task,
  venture,
  ventureActivities,
  todayCheckin,
  today,
  weights = DEFAULT_LEVERAGE_WEIGHTS,
}: ScoreInputs): LeverageResult {
  const raw = {
    urgency: urgencyValue(task.due_date, today),
    strategic: strategicValue(venture),
    neglect: neglectValue(ventureActivities, today),
    judgment: judgmentValue(task),
    energy_fit: energyFitValue(task, todayCheckin),
  };

  const components: ComponentResult[] = LEVERAGE_COMPONENT_ORDER.map((key) => {
    const weight = weights[key];
    const value = raw[key].value;
    return {
      key,
      label: LEVERAGE_COMPONENTS[key].label,
      value,
      weight,
      contribution: value * weight * 100,
      explanation: raw[key].explanation,
    };
  });

  const total = components.reduce((sum, c) => sum + c.contribution, 0);
  const suggestDelegate =
    task.inversion_tag === "execution" && total >= DELEGATE_NUDGE_THRESHOLD;

  return {
    taskId: task.id,
    total: Math.round(total * 10) / 10,
    components,
    suggestDelegate,
  };
}

export interface RankedTask {
  task: Task;
  venture: Venture;
  result: LeverageResult;
}

/**
 * Rank open tasks by leverage. Tasks belonging to vault/dormant ventures are
 * excluded (§6.2 "vault/dormant excluded"), as are completed tasks.
 */
export function rankTasks(
  tasks: Task[],
  ventures: Venture[],
  activities: Activity[],
  todayCheckin: Checkin | null,
  today: string,
  weights?: LeverageWeights,
): RankedTask[] {
  const ventureById = new Map(ventures.map((v) => [v.id, v]));
  const activityByVenture = new Map<string, Activity[]>();
  for (const a of activities) {
    const list = activityByVenture.get(a.venture_id) ?? [];
    list.push(a);
    activityByVenture.set(a.venture_id, list);
  }

  const ranked: RankedTask[] = [];
  for (const task of tasks) {
    if (task.status === "done") continue;
    const venture = ventureById.get(task.venture_id);
    if (!venture) continue;
    if (venture.status === "vault" || venture.status === "dormant") continue;

    const result = computeLeverage({
      task,
      venture,
      ventureActivities: activityByVenture.get(venture.id) ?? [],
      todayCheckin,
      today,
      weights,
    });
    ranked.push({ task, venture, result });
  }

  ranked.sort((a, b) => b.result.total - a.result.total);
  return ranked;
}
