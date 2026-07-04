import { useMemo } from "react";
import { format } from "date-fns";
import { useOpenActions } from "@/hooks/useActions";
import { useCategoryActivity } from "@/hooks/useCategoryActivity";
import { scoringEngine } from "@/lib/scoring";
import { ActionComposer } from "@/components/today/ActionComposer";
import { ActionRow } from "@/components/today/ActionRow";
import { CategoryTotals } from "@/components/today/CategoryTotals";

export default function Today() {
  const { data: actions, isLoading, error } = useOpenActions();
  const { data: categoryActivity } = useCategoryActivity();

  const ranked = useMemo(
    () => (actions ? scoringEngine.rank(actions, { now: new Date(), categoryActivity }) : []),
    [actions, categoryActivity],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d")} — highest leverage first
        </p>
      </header>

      <ActionComposer />

      {error && (
        <p className="text-sm text-destructive">Couldn't load actions: {error.message}</p>
      )}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && !error && ranked.length === 0 && (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          Nothing on the list. Add the one thing that would matter most today.
        </div>
      )}

      {ranked.length > 0 && (
        <ul className="space-y-2">
          {ranked.map((r, i) => (
            <ActionRow key={r.action.id} ranked={r} rank={i + 1} />
          ))}
        </ul>
      )}

      <CategoryTotals />
    </div>
  );
}
