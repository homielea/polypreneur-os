"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Plus, Send, Trash2, Power } from "lucide-react";
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
import { PLATFORM_LIST, platformDef } from "@/lib/distribution/platforms";
import type {
  AgentJob,
  ChannelConnection,
  Publication,
  Venture,
  VideoProduction,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/** A publishable item — either an approved text piece or an approved video. */
interface Publishable {
  kind: "job" | "production";
  id: string;
  label: string;
  venture_id: string | null;
}

function jobToPublishable(job: AgentJob): Publishable {
  return { kind: "job", id: job.id, label: jobLabel(job), venture_id: job.venture_id };
}
function productionToPublishable(p: VideoProduction): Publishable {
  return {
    kind: "production",
    id: p.id,
    label: `🎬 ${p.title || "Faceless video"}`,
    venture_id: p.venture_id,
  };
}

const AGENT_LABEL: Record<string, string> = {
  scribe: "Scribe",
  repurposer: "Repurposer",
};
const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-600",
  scheduled: "bg-sky-600",
  failed: "bg-destructive",
  canceled: "bg-muted-foreground",
};
const CONN_STYLE: Record<string, string> = {
  connected: "bg-emerald-600",
  placeholder: "bg-amber-500",
  disabled: "bg-muted-foreground",
};

function jobLabel(job: AgentJob): string {
  const tag = job.format ? FORMAT_LABEL[job.format] : "Lea's Lesson";
  const first =
    (job.edited_output ?? job.output).split("\n").find((l) => l.trim()) ?? "";
  return `${AGENT_LABEL[job.agent] ?? job.agent} · ${tag} — ${first.slice(0, 60)}`;
}

export default function DistributionPage() {
  const qc = useQueryClient();
  const connections = useQuery({
    queryKey: ["connections"],
    queryFn: () => getJSON<ChannelConnection[]>("/api/connections"),
  });
  const pubs = useQuery({
    queryKey: ["publications"],
    queryFn: () => getJSON<{ publications: Publication[] }>("/api/publications"),
  });
  const jobs = useQuery({
    queryKey: ["agent-jobs"],
    queryFn: () => getJSON<AgentJob[]>("/api/agent-jobs"),
  });
  const ventures = useQuery({
    queryKey: ["ventures-list"],
    queryFn: () => getJSON<{ ventures: Venture[] }>("/api/ventures"),
  });
  const status = useQuery({
    queryKey: ["distribution-status"],
    queryFn: () =>
      getJSON<{ webhook: boolean; beehiiv: boolean }>("/api/distribution/status"),
  });
  const productions = useQuery({
    queryKey: ["productions"],
    queryFn: () => getJSON<VideoProduction[]>("/api/productions"),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["publications"] });
    qc.invalidateQueries({ queryKey: ["connections"] });
  };

  const ventureName = (id: string | null) =>
    id ? (ventures.data?.ventures.find((v) => v.id === id)?.name ?? "—") : "Global";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Distribution</h1>
        <p className="text-muted-foreground">
          Connect channels per venture, compose once, schedule everywhere. You
          approve and schedule; agents take over the grunt-work in v2.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Delivery:</span>
          <Badge
            className={cn("text-white", status.data?.webhook ? "bg-emerald-600" : "bg-muted-foreground")}
          >
            Your pipeline (webhook) {status.data?.webhook ? "connected" : "off"}
          </Badge>
          <Badge variant="outline">
            Beehiiv {status.data?.beehiiv ? "connected" : "draft (needs creds)"}
          </Badge>
          {!status.data?.webhook && (
            <span className="text-muted-foreground">
              · social/video channels are mark-as-posted until your webhook is set
            </span>
          )}
        </div>
      </header>

      <ChannelGrid
        connections={connections.data ?? []}
        ventures={ventures.data?.ventures ?? []}
        ventureName={ventureName}
        onChanged={invalidate}
      />

      <Composer
        items={[
          ...(jobs.data ?? [])
            .filter((j) => j.status === "approved")
            .map(jobToPublishable),
          ...(productions.data ?? [])
            .filter((p) => p.status === "approved")
            .map(productionToPublishable),
        ]}
        connections={connections.data ?? []}
        ventureName={ventureName}
        onChanged={invalidate}
      />

      <Schedule
        publications={pubs.data?.publications ?? []}
        jobs={jobs.data ?? []}
        onChanged={invalidate}
      />
    </div>
  );
}

function ChannelGrid({
  connections,
  ventures,
  ventureName,
  onChanged,
}: {
  connections: ChannelConnection[];
  ventures: Venture[];
  ventureName: (id: string | null) => string;
  onChanged: () => void;
}) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["connections"] });

  const [platform, setPlatform] = useState("x");
  const [ventureId, setVentureId] = useState<string>("global");
  const [handle, setHandle] = useState("");

  const add = useMutation({
    mutationFn: () =>
      sendJSON("/api/connections", "POST", {
        platform,
        handle,
        venture_id: ventureId === "global" ? null : ventureId,
      }),
    onSuccess: () => {
      toast.success("Channel added (placeholder)");
      setHandle("");
      refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const toggle = useMutation({
    mutationFn: (c: ChannelConnection) =>
      sendJSON(`/api/connections/${c.id}`, "PATCH", {
        status: c.status === "disabled" ? "placeholder" : "disabled",
      }),
    onSuccess: () => {
      onChanged();
      refresh();
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => sendJSON(`/api/connections/${id}`, "DELETE"),
    onSuccess: () => {
      onChanged();
      refresh();
    },
  });
  const setBackend = useMutation({
    mutationFn: (v: { id: string; backend: string }) =>
      sendJSON(`/api/connections/${v.id}`, "PATCH", { delivery_backend: v.backend }),
    onSuccess: () => {
      onChanged();
      refresh();
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Channels ({connections.length})
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((c) => {
          const def = platformDef(c.platform);
          return (
            <Card key={c.id} className={cn(c.status === "disabled" && "opacity-50")}>
              <CardContent className="space-y-2 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{def.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.handle || c.display_name} · {ventureName(c.venture_id)}
                    </p>
                  </div>
                  <Badge className={cn("text-white", CONN_STYLE[c.status])}>
                    {c.status}
                  </Badge>
                </div>
                {def.note && (
                  <p className="text-[11px] text-muted-foreground">{def.note}</p>
                )}
                {def.kind !== "manual" && c.platform !== "beehiiv" && c.platform !== "substack" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">via</span>
                    <Select
                      value={c.delivery_backend}
                      onValueChange={(v) => setBackend.mutate({ id: c.id, backend: v })}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="webhook">Your pipeline</SelectItem>
                        <SelectItem value="mark_posted">Mark posted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggle.mutate(c)}
                  >
                    <Power className="mr-1 h-3 w-3" />
                    {c.status === "disabled" ? "Enable" : "Disable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive"
                    onClick={() => del.mutate(c.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add a channel</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_LIST.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ventureId} onValueChange={setVentureId}>
            <SelectTrigger className="w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              {ventures.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="@handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-36"
          />
          <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending}>
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function Composer({
  items,
  connections,
  ventureName,
  onChanged,
}: {
  items: Publishable[];
  connections: ChannelConnection[];
  ventureName: (id: string | null) => string;
  onChanged: () => void;
}) {
  const [itemId, setItemId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [when, setWhen] = useState("");

  const item = items.find((i) => i.id === itemId) ?? null;

  // Channels available to this piece: its venture's channels + global ones.
  const available = useMemo(() => {
    return connections.filter(
      (c) =>
        c.status !== "disabled" &&
        (c.venture_id === null || !item?.venture_id || c.venture_id === item.venture_id),
    );
  }, [connections, item]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const publish = useMutation({
    mutationFn: async () => {
      if (!item || selected.size === 0) throw new Error("Pick a piece and channels.");
      const idField = item.kind === "job" ? { jobId: item.id } : { productionId: item.id };
      for (const connectionId of selected) {
        await sendJSON("/api/publications", "POST", {
          ...idField,
          connectionId,
          scheduledFor: when ? new Date(when).toISOString() : null,
        });
      }
    },
    onSuccess: () => {
      toast.success(when ? "Scheduled" : "Published");
      setSelected(new Set());
      setWhen("");
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Compose
      </h3>
      <Card>
        <CardContent className="space-y-4 py-4">
          <Select value={itemId} onValueChange={(v) => { setItemId(v); setSelected(new Set()); }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an approved piece or video…" />
            </SelectTrigger>
            <SelectContent>
              {items.length === 0 && (
                <SelectItem value="none" disabled>
                  Nothing approved yet
                </SelectItem>
              )}
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {item && (
            <>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Channels for {ventureName(item.venture_id)}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {available.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No channels for this venture. Add one above.
                    </span>
                  )}
                  {available.map((c) => {
                    const on = selected.has(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggle(c.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        {platformDef(c.platform).label}
                        {c.handle ? ` ${c.handle}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="h-9 w-48 text-xs"
                  title="Leave empty to publish now"
                />
                <Button
                  onClick={() => publish.mutate()}
                  disabled={publish.isPending || selected.size === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {when ? "Schedule" : "Publish now"} ({selected.size})
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Schedule({
  publications,
  jobs,
  onChanged,
}: {
  publications: Publication[];
  jobs: AgentJob[];
  onChanged: () => void;
}) {
  const runDue = useMutation({
    mutationFn: () => sendJSON<{ sent: number }>("/api/publications/run", "POST"),
    onSuccess: (r) => {
      toast.success(`Processed ${r.sent} due publication(s)`);
      onChanged();
    },
  });

  // Group by day (scheduled date, else created date) — a light calendar feel.
  const groups = new Map<string, Publication[]>();
  for (const p of publications) {
    const key = (p.scheduled_for ?? p.created_at).slice(0, 10);
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }
  const days = [...groups.keys()].sort().reverse();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Schedule &amp; outbox ({publications.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => runDue.mutate()}
          disabled={runDue.isPending}
        >
          Run due
        </Button>
      </div>
      {days.length === 0 && (
        <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
      )}
      {days.map((day) => (
        <div key={day} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {format(parseISO(day), "EEEE, MMM d")}
          </p>
          {groups.get(day)!.map((p) => (
            <ScheduleRow
              key={p.id}
              pub={p}
              job={jobs.find((j) => j.id === p.job_id)}
              onChanged={onChanged}
            />
          ))}
        </div>
      ))}
    </section>
  );
}

function ScheduleRow({
  pub,
  job,
  onChanged,
}: {
  pub: Publication;
  job?: AgentJob;
  onChanged: () => void;
}) {
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
      <CardContent className="flex items-center gap-3 py-2">
        <Badge variant="outline">{platformDef(pub.channel).label}</Badge>
        <span className="min-w-0 flex-1 truncate text-sm">
          {job ? jobLabel(job) : "(job removed)"}
        </span>
        {pub.scheduled_for && (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(pub.scheduled_for), "HH:mm")}
          </span>
        )}
        <Badge className={cn("text-white", STATUS_STYLE[pub.status])}>
          {pub.status}
        </Badge>
        {(pub.status === "failed" || pub.status === "scheduled") && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => send.mutate()}
            disabled={send.isPending}
          >
            <Send className="mr-1 h-3 w-3" /> Send
          </Button>
        )}
        {pub.status === "scheduled" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-destructive"
            onClick={() => cancel.mutate()}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
