/**
 * Venture operations with the 80/20 focus cap enforced (§6.5).
 */

import "server-only";
import { insert, list, newId, nowIso, update } from "@/lib/db";
import { FOCUS_CAPS } from "@/config/focus.config";
import type { Venture, VentureStatus } from "@/lib/types";

export class FocusCapError extends Error {
  constructor(public status: "primary" | "experiment") {
    super(
      status === "primary"
        ? `Primary cap reached (${FOCUS_CAPS.primary}). Demote a primary venture or send the idea to the Idea Vault first.`
        : `Experiment cap reached (${FOCUS_CAPS.experiment}). Demote the active experiment or park the idea in the Idea Vault.`,
    );
    this.name = "FocusCapError";
  }
}

export interface FocusCounts {
  primary: { used: number; cap: number };
  experiment: { used: number; cap: number };
}

export function countActive(ventures: Venture[]): FocusCounts {
  return {
    primary: {
      used: ventures.filter((v) => v.status === "primary").length,
      cap: FOCUS_CAPS.primary,
    },
    experiment: {
      used: ventures.filter((v) => v.status === "experiment").length,
      cap: FOCUS_CAPS.experiment,
    },
  };
}

/** Throws FocusCapError if moving to an active slot would exceed the cap. */
function assertCapAllows(
  ventures: Venture[],
  target: VentureStatus,
  excludeId?: string,
) {
  if (target !== "primary" && target !== "experiment") return;
  const counts = countActive(ventures.filter((v) => v.id !== excludeId));
  if (target === "primary" && counts.primary.used >= FOCUS_CAPS.primary) {
    throw new FocusCapError("primary");
  }
  if (target === "experiment" && counts.experiment.used >= FOCUS_CAPS.experiment) {
    throw new FocusCapError("experiment");
  }
}

export async function createVenture(
  name: string,
  status: VentureStatus,
): Promise<Venture> {
  const ventures = await list("venture");
  assertCapAllows(ventures, status);
  const venture: Venture = {
    id: newId(),
    name: name.trim(),
    status,
    created_at: nowIso(),
  };
  return insert("venture", venture);
}

export async function setVentureStatus(
  id: string,
  status: VentureStatus,
): Promise<Venture> {
  const ventures = await list("venture");
  assertCapAllows(ventures, status, id);
  return update("venture", id, { status });
}
