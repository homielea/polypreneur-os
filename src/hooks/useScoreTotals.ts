import { useQuery } from "@tanstack/react-query";
import { endOfWeek, startOfWeek } from "date-fns";
import { scoringEngine } from "@/lib/scoring";
import { scoreTotalsKey } from "@/hooks/useActions";

/** Points gathered this week (Mon–Sun), per category. Display-only — no targets, no streaks. */
export function useWeeklyScoreTotals() {
  const now = new Date();
  const from = startOfWeek(now, { weekStartsOn: 1 });
  const to = endOfWeek(now, { weekStartsOn: 1 });
  return useQuery({
    // Key includes the week so a tab spanning the Monday boundary can't keep
    // serving last week's cached totals as "this week".
    queryKey: [...scoreTotalsKey, "week", from.toISOString().slice(0, 10)],
    queryFn: () => scoringEngine.totals({ from, to }),
  });
}
