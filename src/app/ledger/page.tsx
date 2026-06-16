"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJSON, sendJSON } from "@/lib/client";
import type { LedgerPayload } from "@/lib/ledger";
import type { InversionTag, Task, Venture } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function LedgerPage() {
  const qc = useQueryClient();
  const ledger = useQuery({
    queryKey: ["ledger"],
    queryFn: () => getJSON<LedgerPayload>("/api/ledger"),
  });
  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getJSON<Task[]>("/api/tasks"),
  });
  const ventures = useQuery({
    queryKey: ["ventures-list"],
    queryFn: () => getJSON<{ ventures: Venture[] }>("/api/ventures"),
  });

  const retag = useMutation({
    mutationFn: (v: { id: string; tag: InversionTag }) =>
      sendJSON(`/api/tasks/${v.id}`, "PATCH", { inversion_tag: v.tag }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
  });

  if (ledger.isLoading || !ledger.data) {
    return <p className="text-muted-foreground">Loading ledger…</p>;
  }

  const { counts, history } = ledger.data;
  const judgmentPct = Math.round(counts.judgmentShare * 100);
  const ventureName = (id: string) =>
    ventures.data?.ventures.find((v) => v.id === id)?.name ?? "—";

  const openTasks = (tasks.data ?? []).filter((t) => t.status !== "done");

  const chartData = history.map((s) => ({
    date: format(parseISO(s.date), "MMM d"),
    judgment: s.judgment,
    execution: s.execution,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">The Great Inversion Ledger</h1>
        <p className="text-muted-foreground">
          As AI commoditizes execution, judgment is the scarce layer. Route
          execution work to agents; protect time for judgment.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Judgment share (open work)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tabular-nums">{judgmentPct}%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {counts.judgment} judgment · {counts.execution} execution
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Execution vs judgment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-primary"
                style={{ width: `${judgmentPct}%` }}
                title={`Judgment ${counts.judgment}`}
              />
              <div
                className="bg-sky-400"
                style={{ width: `${100 - judgmentPct}%` }}
                title={`Execution ${counts.execution}`}
              />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" /> Judgment (you)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-400" /> Execution
                (delegate)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ratio trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            One snapshot recorded per day of use — the trend grows as you work.
          </p>
        </CardHeader>
        <CardContent>
          {chartData.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Not enough history yet. Come back tomorrow — a daily snapshot is
              recorded each time you open the ledger.
            </p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="judgment"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="execution"
                    stroke="#38bdf8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tag your open work</CardTitle>
          <p className="text-sm text-muted-foreground">
            Could an agent do it (execution) or is it yours alone (judgment)?
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {openTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No open tasks.</p>
          )}
          {openTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {ventureName(t.venture_id)}
                </p>
              </div>
              <div className="flex shrink-0 overflow-hidden rounded-md border">
                {(["judgment", "execution"] as InversionTag[]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => retag.mutate({ id: t.id, tag })}
                    className={cn(
                      "px-3 py-1 text-xs font-medium capitalize transition-colors",
                      t.inversion_tag === tag
                        ? tag === "judgment"
                          ? "bg-primary text-primary-foreground"
                          : "bg-sky-400 text-white"
                        : "bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
