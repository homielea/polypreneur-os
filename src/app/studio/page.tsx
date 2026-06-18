"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Clapperboard, Film, RefreshCw, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJSON, sendJSON } from "@/lib/client";
import { FORMAT_LABEL } from "@/lib/agents/repurposer/prompt";
import type { RenderBackendInfo } from "@/lib/content-engine/video/render/types";
import type { AgentJob, VideoProduction } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-muted-foreground",
  awaiting_approval: "bg-sky-600",
  approved: "bg-emerald-600",
  rejected: "bg-muted-foreground",
  failed: "bg-destructive",
};

function jobLabel(job: AgentJob): string {
  const tag = job.format ? FORMAT_LABEL[job.format] : "Lea's Lesson";
  const first = (job.edited_output ?? job.output).split("\n").find((l) => l.trim()) ?? "";
  return `${tag} — ${first.slice(0, 60)}`;
}

export default function StudioPage() {
  const qc = useQueryClient();
  const productions = useQuery({
    queryKey: ["productions"],
    queryFn: () => getJSON<VideoProduction[]>("/api/productions"),
  });
  const jobs = useQuery({
    queryKey: ["agent-jobs"],
    queryFn: () => getJSON<AgentJob[]>("/api/agent-jobs"),
  });
  const backends = useQuery({
    queryKey: ["render-backends"],
    queryFn: () =>
      getJSON<{ backends: RenderBackendInfo[] }>("/api/render/backends"),
  });

  const [jobId, setJobId] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["productions"] });

  const create = useMutation({
    mutationFn: () => sendJSON("/api/productions", "POST", { jobId }),
    onSuccess: () => {
      toast.success("Production created — generate the package");
      setJobId("");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const approved = (jobs.data ?? []).filter((j) => j.status === "approved");
  const all = productions.data ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Studio — faceless video</h1>
        <p className="text-muted-foreground">
          The Producer turns an approved piece into a video package — voiceover
          script, scene/b-roll plan, title, thumbnail concept. You approve before
          anything is rendered or distributed. Rendering uses HeyGen when
          configured (stub otherwise); approved videos hand off to your pipeline
          via the distribution webhook.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Render backends:</span>
          {(backends.data?.backends ?? []).map((b) => (
            <Badge
              key={b.key}
              variant={b.wired && b.configured ? "default" : "outline"}
              title={b.note}
            >
              {b.label}
              {b.wired ? "" : b.configured ? " · key set, wiring pending" : " · planned"}
            </Badge>
          ))}
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New production</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className="min-w-[280px] flex-1">
              <SelectValue placeholder="From an approved piece…" />
            </SelectTrigger>
            <SelectContent>
              {approved.length === 0 && (
                <SelectItem value="none" disabled>
                  Nothing approved yet
                </SelectItem>
              )}
              {approved.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {jobLabel(j)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => create.mutate()} disabled={!jobId || create.isPending}>
            <Clapperboard className="mr-2 h-4 w-4" /> Create
          </Button>
        </CardContent>
      </Card>

      {productions.isLoading && <p className="text-muted-foreground">Loading…</p>}
      {all.length === 0 && !productions.isLoading && (
        <p className="text-sm text-muted-foreground">
          No productions yet. Create one from an approved piece above.
        </p>
      )}
      {all.map((p) => (
        <ProductionCard key={p.id} prod={p} onChanged={invalidate} />
      ))}
    </div>
  );
}

function ProductionCard({
  prod,
  onChanged,
}: {
  prod: VideoProduction;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(prod.title);
  const [vo, setVo] = useState(prod.voiceover_script);
  const scenes: string[] = (() => {
    try {
      return JSON.parse(prod.scene_plan || "[]");
    } catch {
      return [];
    }
  })();

  const act = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sendJSON(`/api/productions/${prod.id}`, "PATCH", body),
    onSuccess: (_d, body) => {
      const a = (body as { action?: string }).action;
      toast.success(
        a === "generate"
          ? "Package generated"
          : a === "render"
            ? "Render started"
            : a === "poll"
              ? "Refreshed"
              : a === "approve"
                ? "Approved"
                : a === "reject"
                  ? "Rejected"
                  : "Saved",
      );
      onChanged();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const del = useMutation({
    mutationFn: () => sendJSON(`/api/productions/${prod.id}`, "DELETE"),
    onSuccess: onChanged,
  });

  const isDraft = prod.status === "draft";
  const review = prod.status === "awaiting_approval";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Film className="mr-1 inline h-4 w-4" /> Production
          </CardTitle>
          <Badge className={cn("text-white", STATUS_STYLE[prod.status])}>
            {prod.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prod.error && <p className="text-xs text-destructive">{prod.error}</p>}

        {isDraft ? (
          <div className="space-y-2">
            <p className="line-clamp-2 text-sm text-muted-foreground">{prod.script}</p>
            <Button size="sm" onClick={() => act.mutate({ action: "generate" })} disabled={act.isPending}>
              <RefreshCw className="mr-1 h-3 w-3" /> Generate package
            </Button>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Voiceover script</label>
              <Textarea rows={5} value={vo} onChange={(e) => setVo(e.target.value)} />
            </div>
            {scenes.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Scene / b-roll plan</p>
                <ol className="ml-4 list-decimal text-sm">
                  {scenes.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
            {prod.thumbnail_concept && (
              <p className="text-sm">
                <span className="text-xs text-muted-foreground">Thumbnail: </span>
                {prod.thumbnail_concept}
              </p>
            )}
            {prod.video_url ? (
              <p className="text-xs">
                Rendered ({prod.backend}):{" "}
                <a className="text-sky-700 underline" href={prod.video_url}>
                  {prod.video_url}
                </a>
              </p>
            ) : prod.render_job_id ? (
              <div className="flex items-center gap-2 text-xs text-sky-700">
                <span>Rendering on {prod.backend}…</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => act.mutate({ action: "poll" })}
                  disabled={act.isPending}
                >
                  <RefreshCw className="mr-1 h-3 w-3" /> Refresh
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Not rendered yet.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => act.mutate({ title, voiceover_script: vo })}
                disabled={act.isPending}
              >
                Save edits
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => act.mutate({ action: "render" })}
                disabled={act.isPending}
              >
                <Film className="mr-1 h-3 w-3" /> Render
              </Button>
              {review && (
                <>
                  <Button
                    size="sm"
                    onClick={() => act.mutate({ action: "approve", title, voiceover_script: vo })}
                    disabled={act.isPending}
                  >
                    <Check className="mr-1 h-3 w-3" /> Approve
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
                </>
              )}
              {prod.status === "approved" && (
                <span className="self-center text-xs text-muted-foreground">
                  Approved — publish it from Distribution.
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => del.mutate()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
