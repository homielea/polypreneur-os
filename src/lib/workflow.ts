/**
 * Content workflow — the gated autopilot and the v2 agent hand-off seam.
 *
 * It runs the mechanical 80% (scan → draft → repurpose → produce a video
 * package) UP TO each approval gate, and never through it. Approval and
 * publishing stay human (judgment-stays-human). An orchestrator agent drives
 * this in v2: run the workflow, surface what's awaiting approval, stop.
 *
 * Host-level orchestration (composes the agents + the content engine); kept out
 * of content-engine so the engine stays extraction-clean.
 */

import "server-only";
import { list } from "@/lib/db";
import { runIntake, type IntakeResult } from "@/lib/agents/scribe/intake";
import { runJob } from "@/lib/agents/run";
import { enqueueRepurpose } from "@/lib/agents/repurposer/enqueue";
import {
  createProduction,
  generatePackage,
} from "@/lib/content-engine/video/productions";
import { createEngineContext } from "@/lib/engine";

export interface WorkflowOptions {
  intake?: boolean; // scan sources -> pending Scribe jobs
  draft?: boolean; // run pending jobs -> awaiting_approval
  advanceRepurpose?: boolean; // approved Scribe piece -> Repurposer jobs
  advanceVideo?: boolean; // approved Scribe piece -> faceless video package
}

function countBy<T>(rows: T[], key: (r: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = key(r);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export interface PipelineStatus {
  jobs: Record<string, number>;
  productions: Record<string, number>;
  publications: Record<string, number>;
  awaitingApproval: number; // the operator's queue (drafts + video packages)
}

export async function pipelineStatus(): Promise<PipelineStatus> {
  const [jobs, productions, publications] = await Promise.all([
    list("agent_job"),
    list("video_production"),
    list("publication"),
  ]);
  return {
    jobs: countBy(jobs, (j) => j.status),
    productions: countBy(productions, (p) => p.status),
    publications: countBy(publications, (p) => p.status),
    awaitingApproval:
      jobs.filter((j) => j.status === "awaiting_approval").length +
      productions.filter((p) => p.status === "awaiting_approval").length,
  };
}

export interface WorkflowReport {
  intake?: IntakeResult;
  repurposeQueued: number;
  videosQueued: number;
  drafted: number;
  notes: string[];
  funnel: PipelineStatus;
}

export async function runWorkflow(
  opts: WorkflowOptions,
): Promise<WorkflowReport> {
  const ctx = createEngineContext();
  const notes: string[] = [];
  let repurposeQueued = 0;
  let videosQueued = 0;
  let drafted = 0;
  let intake: IntakeResult | undefined;

  if (opts.intake) {
    intake = await runIntake();
    notes.push(`Intake: ${intake.created} new job(s).`);
  }

  // Advance approved pieces to the NEXT stage's drafts (still gated).
  if (opts.advanceRepurpose) {
    const approved = (await list("agent_job")).filter(
      (j) => j.agent === "scribe" && j.status === "approved",
    );
    for (const job of approved) {
      const r = await enqueueRepurpose(job);
      repurposeQueued += r.created;
    }
    notes.push(`Queued ${repurposeQueued} repurpose job(s) from approved pieces.`);
  }

  if (opts.advanceVideo) {
    const productions = await list("video_production");
    const approved = (await list("agent_job")).filter(
      (j) => j.agent === "scribe" && j.status === "approved",
    );
    for (const job of approved) {
      if (productions.some((p) => p.job_id === job.id)) continue;
      const prod = await createProduction(ctx, job.id);
      await generatePackage(ctx, prod.id);
      videosQueued++;
    }
    notes.push(`Generated ${videosQueued} video package(s) from approved pieces.`);
  }

  // Draft every pending job (Scribe + Repurposer), including freshly-queued ones.
  if (opts.draft) {
    const pending = (await list("agent_job")).filter((j) => j.status === "pending");
    for (const job of pending) {
      await runJob(job);
      drafted++;
    }
    notes.push(`Drafted ${drafted} job(s) → awaiting approval.`);
  }

  return {
    intake,
    repurposeQueued,
    videosQueued,
    drafted,
    notes,
    funnel: await pipelineStatus(),
  };
}
