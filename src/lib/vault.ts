import { addDays } from "date-fns";
import type { Idea } from "@/types/domain";

/**
 * How long a vaulted idea rests before resurfacing for re-evaluation.
 * Rhythm, not deadline: nothing turns red or expires — due ideas just
 * move to the "worth another look?" queue.
 */
export const RESURFACE_INTERVAL_DAYS = 30;

export function nextResurfaceDate(from: Date): string {
  return addDays(from, RESURFACE_INTERVAL_DAYS).toISOString();
}

export interface VaultPartition {
  due: Idea[];
  resting: Idea[];
}

/**
 * Split active vaulted ideas into due-for-another-look vs still resting.
 * A missing resurface date counts as due — the vault must never hold an idea
 * that can't resurface.
 */
export function partitionVault(ideas: Idea[], now: Date): VaultPartition {
  const due: Idea[] = [];
  const resting: Idea[] = [];
  for (const idea of ideas) {
    if (!idea.next_resurface_at || new Date(idea.next_resurface_at) <= now) {
      due.push(idea);
    } else {
      resting.push(idea);
    }
  }
  return { due, resting };
}
