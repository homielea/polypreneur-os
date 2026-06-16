/**
 * Distribution core. The operator initiates every publication from an APPROVED
 * agent_job; nothing publishes itself. Sending is mechanical (not an LLM) and
 * dispatches by channel. Scheduled publications are processed on-demand by
 * `runDuePublications` (the same cadence pattern as the Scribe).
 */

import "server-only";
import { insert, list, newId, nowIso, update } from "@/lib/db";
import type { AgentJob, Channel, Publication } from "@/lib/types";
import { isChannelAvailable } from "./channels";
import { publishToBeehiiv } from "./beehiiv";

function contentOf(job: AgentJob): string {
  return job.edited_output ?? job.output;
}

async function getApprovedJob(jobId: string): Promise<AgentJob> {
  const job = (await list("agent_job")).find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found.");
  if (job.status !== "approved") {
    throw new Error("Only an approved piece can be published.");
  }
  return job;
}

/** Run the channel send for one publication, persisting the outcome. */
export async function sendPublication(pub: Publication): Promise<Publication> {
  try {
    const job = await getApprovedJob(pub.job_id);
    const content = contentOf(job);

    let externalRef: string | null = null;
    switch (pub.channel) {
      case "manual":
        externalRef = null; // operator copies it out; we just mark it shipped
        break;
      case "beehiiv": {
        const r = await publishToBeehiiv(content);
        externalRef = r.externalRef;
        break;
      }
      case "social":
        throw new Error("Social publishing is stubbed in v1.");
    }

    return update("publication", pub.id, {
      status: "published",
      external_ref: externalRef,
      error: null,
      updated_at: nowIso(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return update("publication", pub.id, {
      status: "failed",
      error: message,
      updated_at: nowIso(),
    });
  }
}

export interface CreatePublicationInput {
  jobId: string;
  channel: Channel;
  scheduledFor?: string | null; // ISO; null/absent = publish now
}

export async function createPublication(
  input: CreatePublicationInput,
): Promise<Publication> {
  await getApprovedJob(input.jobId); // validates approved
  if (input.channel !== "manual" && !isChannelAvailable(input.channel)) {
    throw new Error(`Channel "${input.channel}" is not available.`);
  }

  const ts = nowIso();
  const scheduledFor = input.scheduledFor ?? null;
  const pub: Publication = {
    id: newId(),
    job_id: input.jobId,
    channel: input.channel,
    status: "scheduled",
    scheduled_for: scheduledFor,
    external_ref: null,
    error: null,
    created_at: ts,
    updated_at: ts,
  };
  const created = await insert("publication", pub);

  // Publish immediately unless scheduled for the future.
  if (!scheduledFor || scheduledFor <= ts) {
    return sendPublication(created);
  }
  return created;
}

export async function cancelPublication(id: string): Promise<Publication> {
  return update("publication", id, {
    status: "canceled",
    updated_at: nowIso(),
  });
}

export interface RunDueResult {
  sent: number;
  results: { id: string; status: string; error: string | null }[];
}

/** Process scheduled publications whose time has arrived. */
export async function runDuePublications(): Promise<RunDueResult> {
  const now = nowIso();
  const due = (await list("publication")).filter(
    (p) =>
      p.status === "scheduled" &&
      (p.scheduled_for === null || p.scheduled_for <= now),
  );
  const results = [];
  for (const pub of due) {
    const updated = await sendPublication(pub);
    results.push({ id: updated.id, status: updated.status, error: updated.error });
  }
  return { sent: results.length, results };
}
