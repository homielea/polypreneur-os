import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import { ACTIVITY_LOOKBACK_DAYS } from "@/lib/scoring";
import { scoreTotalsKey } from "@/hooks/useActions";

/**
 * Most recent score-event timestamp per category within the lookback window —
 * the Neglect Radar's input. Keyed under scoreTotalsKey so completing an
 * action (which invalidates that prefix) refreshes this too.
 */
export function useCategoryActivity() {
  return useQuery({
    queryKey: [...scoreTotalsKey, "category-activity"],
    queryFn: async (): Promise<Record<string, string>> => {
      const since = subDays(new Date(), ACTIVITY_LOOKBACK_DAYS);
      const { data, error } = await supabase
        .from("score_events")
        .select("category, created_at")
        .gte("created_at", since.toISOString());
      if (error) throw new Error(error.message);
      const latest: Record<string, string> = {};
      for (const row of data ?? []) {
        if (!latest[row.category] || row.created_at > latest[row.category]) {
          latest[row.category] = row.created_at;
        }
      }
      return latest;
    },
  });
}
