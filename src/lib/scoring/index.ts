import { ScoringEngine } from "./engine";
import { manualLeverage, neglectRadar, reflectionPipe, top20Boost } from "./providers";
import { createSupabaseScoreStore } from "./supabaseStore";

export * from "./types";
export { ScoringEngine } from "./engine";
export { manualLeverage, neglectRadar, reflectionPipe, top20Boost } from "./providers";

/** App-wide engine instance with the registered providers. */
export const scoringEngine = new ScoringEngine(createSupabaseScoreStore());
scoringEngine.registerProvider(manualLeverage);
scoringEngine.registerProvider(top20Boost);
scoringEngine.registerProvider(neglectRadar);
scoringEngine.registerProvider(reflectionPipe);
