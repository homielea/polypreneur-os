import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { scoreTotalsKey } from "@/hooks/useActions";

/**
 * Most recent score-event timestamp per category, all-time — the Neglect
 * Radar's input. No date window: a bounded window can't distinguish "never
 * gathered points" from "gathered points long ago", which made long-dormant
 * categories with a fresh action read as not neglected. Two-column
 * projection keeps the payload small at personal scale; if event volume ever
 * matters, replace with a SQL MAX(created_at) GROUP BY category view/RPC.
 *
 * Keyed under scoreTotalsKey so completing an action (which invalidates that
 * prefix) refreshes this too.
 */
export function useCategoryActivity() {
  return useQuery({
    queryKey: [...scoreTotalsKey, "category-activity"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("score_events").select("category, created_at");
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
