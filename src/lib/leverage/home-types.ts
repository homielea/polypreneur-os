/**
 * Serializable home-screen payload shape. Kept in its own (non server-only)
 * module so client components can import the type without pulling server code.
 */

import type { LeverageWeights } from "@/config/leverage.config";
import type { RankedTask } from "@/lib/leverage/score";

export interface HomePayload {
  today: string;
  hasCheckinToday: boolean;
  weights: LeverageWeights;
  weightsCustomized: boolean;
  pinnedTaskId: string | null;
  hero: RankedTask | null;
  heroIsOverride: boolean;
  heroFallbackToExecution: boolean;
  runnersUp: RankedTask[];
  delegate: RankedTask[];
  ranked: RankedTask[];
}
