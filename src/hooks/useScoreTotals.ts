import { useQuery } from "@tanstack/react-query";
import { endOfWeek, startOfWeek } from "date-fns";
import { scoringEngine } from "@/lib/scoring";
import { scoreTotalsKey } from "@/hooks/useActions";

/** Points gathered this week (Mon–Sun), per category. Display-only — no targets, no streaks. */
export function useWeeklyScoreTotals() {
  return useQuery({
    queryKey: [...scoreTotalsKey, "week"],
    queryFn: () => {
      const now = new Date();
      return scoringEngine.totals({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      });
    },
  });
}
