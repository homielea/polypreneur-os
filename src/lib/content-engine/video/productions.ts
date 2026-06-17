/**
 * Faceless-video production orchestration. Same shape as the agent loop:
 * source (approved script) -> Producer package -> human approval -> render ->
 * distribute. Depends only on the EngineContext (ports) — no host imports.
 */

import type { EngineContext } from "@/lib/content-engine/ports";
import type { AgentJob, VideoProduction } from "@/lib/types";
import { produceVideoPackage } from "./producer";
import { resolveRenderBackend } from "./render/registry";

function scriptOf(job: AgentJob): string {
  return job.edited_output ?? job.output;
}

export async function createProduction(
  ctx: EngineContext,
  jobId: string,
): Promise<VideoProduction> {
  const job = (await ctx.store.list("agent_job")).find((j) => j.id === jobId);
  if (!job) throw new Error("Source job not found.");
  if (job.status !== "approved") {
    throw new Error("Produce videos from an approved piece.");
  }
  const ts = ctx.store.now();
  const prod: VideoProduction = {
    id: ctx.store.newId(),
    job_id: job.id,
    venture_id: job.venture_id, // opaque project id to the engine
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
  return ctx.store.insert("video_production", prod);
}

async function getProduction(
  ctx: EngineContext,
  id: string,
): Promise<VideoProduction> {
  const p = (await ctx.store.list("video_production")).find((x) => x.id === id);
  if (!p) throw new Error("Production not found.");
  return p;
}

export async function generatePackage(
  ctx: EngineContext,
  id: string,
): Promise<VideoProduction> {
  const prod = await getProduction(ctx, id);
  try {
    const pkg = await produceVideoPackage(ctx.llm, prod.script);
    return ctx.store.update("video_production", id, {
      title: pkg.title,
      voiceover_script: pkg.voiceover_script,
      scene_plan: JSON.stringify(pkg.scenes),
      thumbnail_concept: pkg.thumbnail_concept,
      status: "awaiting_approval",
      error: null,
      updated_at: ctx.store.now(),
    });
  } catch (err) {
    return ctx.store.update("video_production", id, {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
      updated_at: ctx.store.now(),
    });
  }
}

export async function renderProduction(
  ctx: EngineContext,
  id: string,
  preferredBackend?: string,
): Promise<VideoProduction> {
  const prod = await getProduction(ctx, id);
  try {
    const backend = resolveRenderBackend(ctx.config, preferredBackend);
    const { videoUrl, backend: used } = await backend.render(
      {
        title: prod.title,
        voiceoverScript: prod.voiceover_script,
        scenes: JSON.parse(prod.scene_plan || "[]"),
        thumbnailConcept: prod.thumbnail_concept,
      },
      ctx.config,
    );
    return ctx.store.update("video_production", id, {
      video_url: videoUrl,
      backend: used,
      error: null,
      updated_at: ctx.store.now(),
    });
  } catch (err) {
    return ctx.store.update("video_production", id, {
      error: err instanceof Error ? err.message : "Render failed",
      updated_at: ctx.store.now(),
    });
  }
}

export async function updateProduction(
  ctx: EngineContext,
  id: string,
  patch: Partial<VideoProduction>,
): Promise<VideoProduction> {
  const allowed: Partial<VideoProduction> = { updated_at: ctx.store.now() };
  for (const k of [
    "title",
    "voiceover_script",
    "thumbnail_concept",
    "video_url",
    "status",
  ] as (keyof VideoProduction)[]) {
    if (k in patch) (allowed as Record<string, unknown>)[k] = patch[k];
  }
  return ctx.store.update("video_production", id, allowed);
}
