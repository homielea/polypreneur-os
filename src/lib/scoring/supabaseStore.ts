import { supabase } from "@/lib/supabase";
import type { CategoryTotal, DateRange, ScoreEventInput, ScoreStore } from "./types";

/** Supabase-backed ScoreStore. user_id is stamped here; RLS enforces it server-side too. */
export function createSupabaseScoreStore(): ScoreStore {
  return {
    async insertEvent(event: ScoreEventInput) {
      // Resolve identity at insert time from the session, not a cached side-channel —
      // avoids the reload window where auth listeners haven't fired yet.
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("score_events").insert({
        user_id: userId,
        action_id: event.actionId ?? null,
        source: event.source,
        category: event.category,
        points: event.points,
      });
      if (error) throw new Error(error.message);
    },

    async totals(range: DateRange): Promise<CategoryTotal[]> {
      const { data, error } = await supabase
        .from("score_events")
        .select("category, points")
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());
      if (error) throw new Error(error.message);
      const byCategory = new Map<string, number>();
      for (const row of data ?? []) {
        byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.points);
      }
      return [...byCategory.entries()]
        .map(([category, points]) => ({ category, points }))
        .sort((a, b) => b.points - a.points);
    },
  };
}
