/**
 * Faceless-video production orchestration. Same shape as the agent loop:
 * source (approved script) -> Producer package -> human approval -> render ->
 * distribute. Nothing is acted on without the operator's approval.
 */

import "server-only";
import { insert, list, newId, nowIso, update } from "@/lib/db";
import type { AgentJob, VideoProduction } from "@/lib/types";
import { produceVideoPackage } from "./producer";
import { renderVideo } from "./render";

function scriptOf(job: AgentJob): string {
  return job.edited_output ?? job.output;
}

export async function createProduction(jobId: string): Promise<VideoProduction> {
  const job = (await list("agent_job")).find((j) => j.id === jobId);
  if (!job) throw new Error("Source job not found.");
  if (job.status !== "approved") {
    throw new Error("Produce videos from an approved piece.");
  }
  const ts = nowIso();
  const prod: VideoProduction = {
    id: newId(),
    job_id: job.id,
    venture_id: job.venture_id,
    script: scriptOf(job),
    title: "",
    voiceover_script: "",
    scene_plan: "[]",
    thumbnail_concept: "",
    video_url: null,
    backend: null,
    status: "draft",
    error: null,
    created_at: ts,
    updated_at: ts,
  };
  return insert("video_production", prod);
}

async function getProduction(id: string): Promise<VideoProduction> {
  const p = (await list("video_production")).find((x) => x.id === id);
  if (!p) throw new Error("Production not found.");
  return p;
}

/** Run the Producer agent to fill the production package. */
export async function generatePackage(id: string): Promise<VideoProduction> {
  const prod = await getProduction(id);
  try {
    const pkg = await produceVideoPackage(prod.script);
    return update("video_production", id, {
      title: pkg.title,
      voiceover_script: pkg.voiceover_script,
      scene_plan: JSON.stringify(pkg.scenes),
      thumbnail_concept: pkg.thumbnail_concept,
      status: "awaiting_approval",
      error: null,
      updated_at: nowIso(),
    });
  } catch (err) {
    return update("video_production", id, {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
      updated_at: nowIso(),
    });
  }
}

/** Render the video asset via the delegated backend (stub in v1). */
export async function renderProduction(id: string): Promise<VideoProduction> {
  const prod = await getProduction(id);
  try {
    const { videoUrl, backend } = await renderVideo({
      title: prod.title,
      voiceover_script: prod.voiceover_script,
      scenes: JSON.parse(prod.scene_plan || "[]"),
      thumbnail_concept: prod.thumbnail_concept,
    });
    return update("video_production", id, {
      video_url: videoUrl,
      backend,
      error: null,
      updated_at: nowIso(),
    });
  } catch (err) {
    return update("video_production", id, {
      error: err instanceof Error ? err.message : "Render failed",
      updated_at: nowIso(),
    });
  }
}

export async function updateProduction(
  id: string,
  patch: Partial<VideoProduction>,
): Promise<VideoProduction> {
  const allowed: Partial<VideoProduction> = { updated_at: nowIso() };
  for (const k of [
    "title",
    "voiceover_script",
    "thumbnail_concept",
    "video_url",
    "status",
  ] as (keyof VideoProduction)[]) {
    if (k in patch) (allowed as Record<string, unknown>)[k] = patch[k];
  }
  return update("video_production", id, allowed);
}
