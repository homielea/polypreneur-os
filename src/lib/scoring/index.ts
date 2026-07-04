import { ScoringEngine } from "./engine";
import { manualLeverage, top20Boost } from "./providers";
import { createSupabaseScoreStore } from "./supabaseStore";

export * from "./types";
export { ScoringEngine } from "./engine";
export { manualLeverage, top20Boost } from "./providers";

/** App-wide engine instance with the v1 providers registered. */
export const scoringEngine = new ScoringEngine(createSupabaseScoreStore());
scoringEngine.registerProvider(manualLeverage);
scoringEngine.registerProvider(top20Boost);
