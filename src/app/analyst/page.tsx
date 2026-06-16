"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Snowflake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJSON, sendJSON } from "@/lib/client";
import type {
  AnalystPayload,
  Trend,
  VentureSignal,
} from "@/lib/analyst/types";
import { cn } from "@/lib/utils";

function TrendBadge({ trend }: { trend: Trend }) {
  const Icon =
    trend === "rising" ? ArrowUpRight : trend === "falling" ? ArrowDownRight : ArrowRight;
  const color =
    trend === "rising"
      ? "text-emerald-600"
      : trend === "falling"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="h-3 w-3" /> {trend}
    </span>
  );
}

function staleness(s: VentureSignal): string {
  if (s.daysSinceActivity === null) return "no activity logged";
  if (s.daysSinceActivity === 0) return "active today";
  return `${s.daysSinceActivity}d since activity`;
}

export default function AnalystPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["analyst"],
    queryFn: () => getJSON<AnalystPayload>("/api/analyst"),
  });

  const ingest = useMutation({
    mutationFn: () => sendJSON<{ inserted: number }>("/api/analyst/ingest", "POST"),
    onSuccess: (r) => {
      toast.success(`Ingested ${r.inserted} metric(s)`);
      qc.invalidateQueries({ queryKey: ["analyst"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading || !data) {
    return <p className="text-muted-foreground">Analyzing…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">The Analyst</h1>
          <p className="text-muted-foreground">
            Transparent, rule-based signals — momentum, neglect, and performance.
            The Analyst surfaces; you judge. (The inner-state correlation engine
            is still later — this is collect-and-surface, not a black box.)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => ingest.mutate()}
          disabled={ingest.isPending}
        >
          <RefreshCw className="mr-2 h-3 w-3" /> Ingest metrics
        </Button>
      </header>

      {data.cold.length > 0 && (
        <Card className="border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Snowflake className="h-4 w-4 text-sky-500" /> Neglect radar — going
              cold
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Active ventures with no movement in {">"} a week. Catch them before
              they die.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.cold.map((s) => (
              <div
                key={s.ventureId}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{staleness(s)}</p>
                </div>
                <Badge variant="outline">{s.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Momentum (active ventures)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Activity in the last 7 days vs the 7 before.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.ventures.map((s) => (
            <div
              key={s.ventureId}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{staleness(s)}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="tabular-nums text-muted-foreground">
                  {s.prior} → {s.recent}
                </span>
                <TrendBadge trend={s.trend} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest value and change for each tracked metric. Ingest pulls from
            live channels (Beehiiv); seeded sample shown otherwise.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No metrics yet. Configure Beehiiv and click “Ingest metrics”.
            </p>
          ) : (
            data.metrics.map((m) => (
              <div
                key={`${m.source}:${m.name}`}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <p className="font-medium capitalize">{m.name.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.source} · {m.date}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold tabular-nums">
                    {m.latest}
                  </span>
                  {m.delta !== null && (
                    <span
                      className={cn(
                        "ml-2 text-xs font-medium",
                        m.delta > 0
                          ? "text-emerald-600"
                          : m.delta < 0
                            ? "text-destructive"
                            : "text-muted-foreground",
                      )}
                    >
                      {m.delta > 0 ? "+" : ""}
                      {m.delta}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
