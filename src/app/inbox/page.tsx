"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Check,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { getJSON, sendJSON } from "@/lib/client";
import type { AgentJob } from "@/lib/types";
import { FORMAT_LABEL } from "@/lib/agents/repurposer/prompt";
import { cn } from "@/lib/utils";

const AGENT_LABEL: Record<string, string> = {
  scribe: "Scribe",
  repurposer: "Repurposer",
};

function JobTags({ job }: { job: AgentJob }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">{AGENT_LABEL[job.agent] ?? job.agent}</Badge>
      {job.format && (
        <Badge variant="outline">{FORMAT_LABEL[job.format]}</Badge>
      )}
    </div>
  );
}

export default function InboxPage() {
  const qc = useQueryClient();
  const jobs = useQuery({
    queryKey: ["agent-jobs"],
    queryFn: () => getJSON<AgentJob[]>("/api/agent-jobs"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["agent-jobs"] });

  const scan = useMutation({
    mutationFn: () => sendJSON<{ created: number }>("/api/drive/scan", "POST"),
    onSuccess: (r) => {
      toast.success(`Intake complete — ${r.created} new job(s)`);
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const runAll = useMutation({
    mutationFn: () => sendJSON<{ ran: number }>("/api/agents/run", "POST"),
    onSuccess: (r) => {
      toast.success(`Agents ran on ${r.ran} job(s)`);
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const all = jobs.data ?? [];
  const pending = all.filter((j) => j.status === "pending");
  const review = all.filter((j) => j.status === "awaiting_approval");
  const approved = all.filter((j) => j.status === "approved");
  const rejected = all.filter((j) => j.status === "rejected");

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold">Agent Approval Inbox</h1>
          <p className="text-muted-foreground">
            The Scribe proposes; you dispose. Nothing an agent writes ships
            without your approval.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => scan.mutate()}
            disabled={scan.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Scan for inputs
          </Button>
          <Button
            onClick={() => runAll.mutate()}
            disabled={runAll.isPending || pending.length === 0}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Run agents ({pending.length} pending)
          </Button>
        </div>
      </header>

      {jobs.isLoading && <p className="text-muted-foreground">Loading inbox…</p>}

      {review.length > 0 && (
        <Section title={`Awaiting your approval (${review.length})`}>
          {review.map((job) => (
            <ReviewCard key={job.id} job={job} onChanged={invalidate} />
          ))}
        </Section>
      )}

      {pending.length > 0 && (
        <Section title={`Pending (${pending.length})`}>
          {pending.map((job) => (
            <PendingCard key={job.id} job={job} onChanged={invalidate} />
          ))}
        </Section>
      )}

      {approved.length > 0 && (
        <Section title={`Approved — ready to ship (${approved.length})`}>
          {approved.map((job) => (
            <ApprovedCard key={job.id} job={job} onChanged={invalidate} />
          ))}
        </Section>
      )}

      {rejected.length > 0 && (
        <Section title={`Rejected (${rejected.length})`}>
          {rejected.map((job) => (
            <Card key={job.id} className="opacity-60">
              <CardContent className="flex items-center justify-between py-3">
                <span className="text-sm">{firstLine(draftOf(job))}</span>
                <DeleteButton id={job.id} onChanged={invalidate} />
              </CardContent>
            </Card>
          ))}
        </Section>
      )}

      {!jobs.isLoading && all.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No agent jobs yet. Flag a check-in with content potential in Inner
            Life OS, then “Scan for inputs”.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function draftOf(job: AgentJob): string {
  return job.edited_output ?? job.output;
}
function firstLine(text: string): string {
  return text.split("\n").find((l) => l.trim()) ?? "(empty)";
}

function SourceDisclosure({ job }: { job: AgentJob }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <ChevronDown
            className={cn("mr-1 h-3 w-3 transition-transform", open && "rotate-180")}
          />
          Source ({job.input_ref})
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <p className="whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {job.input_text || "(empty)"}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function PendingCard({ job, onChanged }: { job: AgentJob; onChanged: () => void }) {
  const run = useMutation({
    mutationFn: () => sendJSON("/api/agents/run", "POST", { jobId: job.id }),
    onSuccess: () => {
      toast.success("Draft ready");
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <JobTags job={job} />
          <Badge variant="outline">pending</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          queued {formatDistanceToNow(parseISO(job.created_at), { addSuffix: true })}
        </span>
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {job.input_text}
        </p>
        {job.error && (
          <p className="text-xs text-destructive">Last error: {job.error}</p>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => run.mutate()} disabled={run.isPending}>
            <Sparkles className="mr-1 h-3 w-3" /> Run
          </Button>
          <DeleteButton id={job.id} onChanged={onChanged} />
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ job, onChanged }: { job: AgentJob; onChanged: () => void }) {
  const [draft, setDraft] = useState(draftOf(job));
  const dirty = draft !== draftOf(job);

  const act = useMutation({
    mutationFn: (v: {
      action: "edit" | "approve" | "reject" | "reset";
    }) => sendJSON(`/api/agent-jobs/${job.id}`, "PATCH", { ...v, edited_output: draft }),
    onSuccess: (_d, v) => {
      toast.success(
        v.action === "approve"
          ? "Approved"
          : v.action === "reject"
            ? "Rejected"
            : v.action === "reset"
              ? "Sent back to re-run"
              : "Edits saved",
      );
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-primary">
            Draft — review &amp; edit
          </CardTitle>
          <Badge>awaiting approval</Badge>
        </div>
        <JobTags job={job} />
      </CardHeader>
      <CardContent className="space-y-3">
        <SourceDisclosure job={job} />
        <Textarea
          rows={12}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="font-serif text-[15px] leading-relaxed"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => act.mutate({ action: "approve" })}
            disabled={act.isPending}
          >
            <Check className="mr-1 h-3 w-3" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => act.mutate({ action: "edit" })}
            disabled={act.isPending || !dirty}
          >
            Save edits
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => act.mutate({ action: "reset" })}
            disabled={act.isPending}
          >
            <RefreshCw className="mr-1 h-3 w-3" /> Re-run
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => act.mutate({ action: "reject" })}
            disabled={act.isPending}
          >
            <X className="mr-1 h-3 w-3" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovedCard({ job, onChanged }: { job: AgentJob; onChanged: () => void }) {
  const repurpose = useMutation({
    mutationFn: () =>
      sendJSON<{ created: number; skippedExisting: number }>(
        `/api/agent-jobs/${job.id}/repurpose`,
        "POST",
      ),
    onSuccess: (r) => {
      toast.success(
        r.created > 0
          ? `Queued ${r.created} repurpose job(s) — run them below`
          : "Already repurposed",
      );
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Approved
          </CardTitle>
          <Badge className="bg-emerald-600">ready to ship</Badge>
        </div>
        <JobTags job={job} />
      </CardHeader>
      <CardContent className="space-y-3">
        <article className="prose prose-sm max-w-none whitespace-pre-wrap font-serif">
          {draftOf(job)}
        </article>
        <p className="text-xs text-muted-foreground">
          Publishing to the content engine (Beehiiv) is stubbed in v1 — copy the
          approved piece out, or wire the integration later.
        </p>
        <div className="flex items-center gap-2">
          {job.agent === "scribe" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => repurpose.mutate()}
              disabled={repurpose.isPending}
            >
              <Sparkles className="mr-1 h-3 w-3" /> Repurpose
            </Button>
          )}
          <DeleteButton id={job.id} onChanged={onChanged} />
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteButton({ id, onChanged }: { id: string; onChanged: () => void }) {
  const del = useMutation({
    mutationFn: () => sendJSON(`/api/agent-jobs/${id}`, "DELETE"),
    onSuccess: onChanged,
  });
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 px-2 text-destructive"
      onClick={() => del.mutate()}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
