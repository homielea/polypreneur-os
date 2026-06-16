"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Bot,
  ChevronDown,
  Pin,
  PinOff,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LeverageBreakdown } from "@/components/cockpit/leverage-breakdown";
import { AnalystSignals } from "@/components/cockpit/analyst-signals";
import { getJSON, sendJSON } from "@/lib/client";
import type { HomePayload } from "@/lib/leverage/home-types";
import type { LeverageResult, RankedTask } from "@/lib/leverage/score";
import { cn } from "@/lib/utils";

const WORK_TYPE_LABEL: Record<string, string> = {
  deep_work: "Deep work",
  admin: "Admin",
  creative: "Creative",
  other: "General",
};

function TagBadges({ item }: { item: RankedTask }) {
  const isJudgment = item.task.inversion_tag === "judgment";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isJudgment ? "default" : "outline"}>
        {isJudgment ? "Judgment" : "Execution"}
      </Badge>
      <Badge variant="secondary">{WORK_TYPE_LABEL[item.task.work_type]}</Badge>
      <span className="text-sm text-muted-foreground">{item.venture.name}</span>
      {item.task.due_date && (
        <span className="text-sm text-muted-foreground">
          · due {format(parseISO(item.task.due_date), "MMM d")}
        </span>
      )}
    </div>
  );
}

function ScoreBadge({
  score,
  big = false,
}: {
  score: LeverageResult;
  big?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground",
        big ? "h-20 w-20" : "h-14 w-14",
      )}
    >
      <span className={cn("font-bold tabular-nums", big ? "text-3xl" : "text-xl")}>
        {Math.round(score.total)}
      </span>
      <span className="text-[10px] uppercase opacity-80">leverage</span>
    </div>
  );
}

function BreakdownToggle({ item }: { item: RankedTask }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <ChevronDown
            className={cn("mr-1 h-3 w-3 transition-transform", open && "rotate-180")}
          />
          Why this score
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <LeverageBreakdown result={item.result} />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function HomeScreen() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["home"],
    queryFn: () => getJSON<HomePayload>("/api/home"),
  });

  const pin = useMutation({
    mutationFn: (taskId: string | null) =>
      sendJSON("/api/home/pin", "POST", { taskId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["home"] }),
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Computing today's leverage…</p>;
  }
  if (error || !data) {
    return (
      <p className="text-destructive">
        Could not load the home screen: {(error as Error)?.message}
      </p>
    );
  }

  const { hero } = data;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today</h1>
            <p className="text-muted-foreground">
              {format(parseISO(data.today), "EEEE, MMMM d")}
            </p>
          </div>
          <Link
            href="/settings"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Weights {data.weightsCustomized ? "(customized)" : "(default §6.2)"}
          </Link>
        </div>
        <p className="mt-3 text-lg font-medium">
          What is my single highest-leverage move today?
        </p>
      </header>

      {!data.hasCheckinToday && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            No check-in yet today — energy fit is using a neutral value.{" "}
            <Link href="/inner-life" className="font-medium underline">
              Check in
            </Link>{" "}
            to sharpen the ranking.
          </span>
        </div>
      )}

      {/* HERO — the single recommended move */}
      {!hero ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No open tasks on active ventures. Add a task to a primary or
            experiment venture to get a recommendation.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-4 w-4" />
                  {data.heroIsOverride
                    ? "Your move (overridden)"
                    : "Your highest-leverage move"}
                </div>
                <h2 className="text-xl font-bold leading-snug">
                  {hero.task.title}
                </h2>
                <TagBadges item={hero} />
              </div>
              <ScoreBadge score={hero.result} big />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.heroFallbackToExecution && (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                No judgment-tagged task available, so the top execution task is
                shown. Consider delegating it to an agent.
              </p>
            )}
            {hero.result.suggestDelegate && (
              <div className="flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">
                <Bot className="h-4 w-4 shrink-0" />
                High-leverage execution work — a good candidate to delegate to an
                agent rather than do yourself.
              </div>
            )}
            <LeverageBreakdown result={hero.result} />
            <div className="flex items-center gap-2 pt-1">
              {data.heroIsOverride ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pin.mutate(null)}
                  disabled={pin.isPending}
                >
                  <PinOff className="mr-2 h-4 w-4" />
                  Clear override
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RUNNERS-UP */}
      {data.runnersUp.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Runners-up
          </h3>
          {data.runnersUp.map((item) => (
            <Card key={item.task.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <ScoreBadge score={item.result} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{item.task.title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-xs"
                      onClick={() => pin.mutate(item.task.id)}
                      disabled={pin.isPending}
                    >
                      <Pin className="mr-1 h-3 w-3" />
                      Make this my move
                    </Button>
                  </div>
                  <TagBadges item={item} />
                  {item.result.suggestDelegate && (
                    <span className="inline-flex items-center gap-1 text-xs text-sky-700">
                      <Bot className="h-3 w-3" /> delegate candidate
                    </span>
                  )}
                  <BreakdownToggle item={item} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* DELEGATE — keep the human in the judgment layer */}
      {data.delegate.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Bot className="h-4 w-4" /> Delegate to an agent
          </h3>
          <p className="text-sm text-muted-foreground">
            High-scoring execution work. Route these to an agent rather than
            spending your judgment on them. (One-click delegate ships in v2.)
          </p>
          {data.delegate.map((item) => (
            <Card key={item.task.id} className="border-sky-200">
              <CardContent className="flex items-center gap-4 py-3">
                <ScoreBadge score={item.result} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{item.task.title}</p>
                  <TagBadges item={item} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* ANALYST SIGNAL — ventures going cold */}
      <AnalystSignals />

      {/* FULL INSPECTABLE RANKING */}
      <InspectableRanking ranked={data.ranked} />
    </div>
  );
}

function InspectableRanking({ ranked }: { ranked: RankedTask[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          <ChevronDown
            className={cn("mr-2 h-4 w-4 transition-transform", open && "rotate-180")}
          />
          {open ? "Hide" : "Show"} full ranking ({ranked.length})
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        {ranked.map((item, i) => (
          <Card key={item.task.id}>
            <CardContent className="space-y-2 py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-right text-sm font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium">{item.task.title}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {item.result.total.toFixed(1)}
                </span>
              </div>
              <div className="pl-9">
                <TagBadges item={item} />
                <div className="mt-2">
                  <LeverageBreakdown result={item.result} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
