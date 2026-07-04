import { useWeeklyScoreTotals } from "@/hooks/useScoreTotals";

/**
 * Points gathered this week, per category. Deliberately quiet:
 * no targets, no comparisons, no streaks — additive accumulation only.
 */
export function CategoryTotals() {
  const { data: totals } = useWeeklyScoreTotals();

  if (!totals || totals.length === 0) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span>Gathered this week:</span>
      {totals.map((t) => (
        <span key={t.category} className="whitespace-nowrap">
          <span className="font-medium text-foreground">{t.points}</span> {t.category}
        </span>
      ))}
    </div>
  );
}
