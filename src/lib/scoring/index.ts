import { supabase } from "@/lib/supabase";
import { ScoringEngine } from "./engine";
import { manualLeverage, top20Boost } from "./providers";
import { createSupabaseScoreStore } from "./supabaseStore";

export * from "./types";
export { ScoringEngine } from "./engine";
export { manualLeverage, top20Boost } from "./providers";

let cachedUserId: string | null = null;
supabase.auth.onAuthStateChange((_event, session) => {
  cachedUserId = session?.user.id ?? null;
});

/** App-wide engine instance with the v1 providers registered. */
export const scoringEngine = new ScoringEngine(createSupabaseScoreStore(() => cachedUserId));
scoringEngine.registerProvider(manualLeverage);
scoringEngine.registerProvider(top20Boost);
