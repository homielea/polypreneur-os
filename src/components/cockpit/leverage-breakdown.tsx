"use client";

import type { LeverageResult } from "@/lib/leverage/score";
import { cn } from "@/lib/utils";

/**
 * The transparent "why" behind a leverage score: every component's normalized
 * value, its weight, and the points it contributed to the total. No black box.
 */
export function LeverageBreakdown({
  result,
  className,
}: {
  result: LeverageResult;
  className?: string;
}) {
  const maxContribution = Math.max(
    ...result.components.map((c) => c.weight * 100),
    1,
  );

  return (
    <div className={cn("space-y-2", className)}>
      {result.components.map((c) => (
        <div key={c.key} className="text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{c.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {c.value.toFixed(2)} × {c.weight.toFixed(2)} ={" "}
              <span className="font-semibold text-foreground">
                {c.contribution.toFixed(1)}
              </span>
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{
                width: `${(c.contribution / maxContribution) * 100}%`,
              }}
            />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{c.explanation}</p>
        </div>
      ))}
      <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
        <span>Total leverage</span>
        <span className="tabular-nums">{result.total.toFixed(1)} / 100</span>
      </div>
    </div>
  );
}
