"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { RefreshCw, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJSON, sendJSON } from "@/lib/client";
import { FORMAT_LABEL } from "@/lib/agents/repurposer/prompt";
import type { AgentJob, Channel, Publication } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChannelInfo {
  key: Channel;
  label: string;
  available: boolean;
  note: string;
}
interface PublicationsResponse {
  publications: Publication[];
  channels: ChannelInfo[];
}

const AGENT_LABEL: Record<string, string> = {
  scribe: "Scribe",
  repurposer: "Repurposer",
};

function jobLabel(job: AgentJob): string {
  const tag = job.format ? FORMAT_LABEL[job.format] : "Lea's Lesson";
  const first =
    (job.edited_output ?? job.output).split("\n").find((l) => l.trim()) ?? "";
  return `${AGENT_LABEL[job.agent] ?? job.agent} · ${tag} — ${first.slice(0, 70)}`;
}

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-600",
  scheduled: "bg-sky-600",
  failed: "bg-destructive",
  canceled: "bg-muted-foreground",
};

export default function DistributionPage() {
  const qc = useQueryClient();
  const pubs = useQuery({
    queryKey: ["publications"],
    queryFn: () => getJSON<PublicationsResponse>("/api/publications"),
  });
  const jobs = useQuery({
    queryKey: ["agent-jobs"],
    queryFn: () => getJSON<AgentJob[]>("/api/agent-jobs"),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["publications"] });
    qc.invalidateQueries({ queryKey: ["agent-jobs"] });
  };

  const runDue = useMutation({
    mutationFn: () => sendJSON<{ sent: number }>("/api/publications/run", "POST"),
    onSuccess: (r) => {
      toast.success(`Processed ${r.sent} due publication(s)`);
      invalidate();
    },
  });

  const approved = (jobs.data ?? []).filter((j) => j.status === "approved");
  const channels = pubs.data?.channels ?? [];
  const publications = pubs.data?.publications ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Distribution</h1>
        <p className="text-muted-foreground">
          Get approved pieces out. You initiate every publish; Beehiiv posts are
          created as drafts — the final send stays your call. Judgment stays
          human, especially at the boundary.
        </p>
        <div className="flex flex-wrap gap-2">
          {channels.map((c) => (
            <Badge key={c.key} variant={c.available ? "secondary" : "outline"}>
              {c.label} {c.available ? "" : "· unavailable"}
            </Badge>
          ))}
        </div>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Approved &amp; ready ({approved.length})
        </h3>
        {approved.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing approved yet. Approve a draft in the inbox first.
          </p>
        )}
        {approved.map((job) => (
          <PublishRow
            key={job.id}
            job={job}
            channels={channels}
            onChanged={invalidate}
          />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Outbox ({publications.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runDue.mutate()}
            disabled={runDue.isPending}
          >
            <RefreshCw className="mr-2 h-3 w-3" /> Run due
          </Button>
        </div>
        {publications.length === 0 && (
          <p className="text-sm text-muted-foreground">No publications yet.</p>
        )}
        {publications.map((p) => (
          <OutboxRow
            key={p.id}
            pub={p}
            jobs={jobs.data ?? []}
            onChanged={invalidate}
          />
        ))}
      </section>
    </div>
  );
}

function PublishRow({
  job,
  channels,
  onChanged,
}: {
  job: AgentJob;
  channels: ChannelInfo[];
  onChanged: () => void;
}) {
  const firstAvailable = channels.find((c) => c.available)?.key ?? "manual";
  const [channel, setChannel] = useState<Channel>(firstAvailable);
  const [when, setWhen] = useState("");

  const publish = useMutation({
    mutationFn: () =>
      sendJSON("/api/publications", "POST", {
        jobId: job.id,
        channel,
        scheduledFor: when ? new Date(when).toISOString() : null,
      }),
    onSuccess: () => {
      toast.success(when ? "Scheduled" : "Published");
      setWhen("");
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3 py-3">
        <p className="min-w-[180px] flex-1 text-sm font-medium">{jobLabel(job)}</p>
        <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {channels.map((c) => (
              <SelectItem key={c.key} value={c.key} disabled={!c.available}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="h-8 w-44 text-xs"
          title="Leave empty to publish now"
        />
        <Button size="sm" onClick={() => publish.mutate()} disabled={publish.isPending}>
          <Send className="mr-1 h-3 w-3" /> {when ? "Schedule" : "Publish now"}
        </Button>
      </CardContent>
    </Card>
  );
}

function OutboxRow({
  pub,
  jobs,
  onChanged,
}: {
  pub: Publication;
  jobs: AgentJob[];
  onChanged: () => void;
}) {
  const job = jobs.find((j) => j.id === pub.job_id);

  const send = useMutation({
    mutationFn: () => sendJSON(`/api/publications/${pub.id}`, "POST"),
    onSuccess: () => {
      toast.success("Sent");
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const cancel = useMutation({
    mutationFn: () => sendJSON(`/api/publications/${pub.id}`, "DELETE"),
    onSuccess: onChanged,
  });

  return (
    <Card>
      <CardContent className="space-y-2 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 flex-1 truncate text-sm">
            {job ? jobLabel(job) : "(job removed)"}
          </span>
          <Badge className={cn("text-white", STATUS_STYLE[pub.status])}>
            {pub.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {pub.channel}
            {pub.scheduled_for &&
              ` · for ${formatDistanceToNow(parseISO(pub.scheduled_for), { addSuffix: true })}`}
            {pub.external_ref && ` · ref ${pub.external_ref}`}
          </span>
          <div className="flex gap-1">
            {(pub.status === "failed" || pub.status === "scheduled") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => send.mutate()}
                disabled={send.isPending}
              >
                <Send className="mr-1 h-3 w-3" /> Send now
              </Button>
            )}
            {pub.status === "scheduled" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-destructive"
                onClick={() => cancel.mutate()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {pub.error && <p className="text-xs text-destructive">{pub.error}</p>}
      </CardContent>
    </Card>
  );
}
