/**
 * Distribution core. The operator initiates every publication from an APPROVED
 * piece — a text agent_job OR an approved faceless-video production. Sending
 * dispatches through the delivery seam (resolveDeliveryAdapter): Beehiiv draft,
 * Blotato for social/video, or "mark as posted" placeholder.
 *
 * Scheduled publications are processed on-demand (runDuePublications).
 */

import "server-only";
import { insert, list, newId, nowIso, update } from "@/lib/db";
import type { Publication } from "@/lib/types";
import { resolveDeliveryAdapter } from "@/lib/content-engine/delivery/registry";

interface ResolvedContent {
  text: string;
  mediaUrls: string[];
}

/** Resolve the text + media for a publication from its job or production. */
async function resolveContent(pub: Publication): Promise<ResolvedContent> {
  if (pub.production_id) {
    const prod = (await list("video_production")).find(
      (p) => p.id === pub.production_id,
    );
    if (!prod) throw new Error("Production not found.");
    if (prod.status !== "approved") {
      throw new Error("Only an approved production can be published.");
    }
    const media = prod.video_url ? [prod.video_url] : [];
    return { text: prod.title || prod.voiceover_script, mediaUrls: media };
  }
  const job = (await list("agent_job")).find((j) => j.id === pub.job_id);
  if (!job) throw new Error("Job not found.");
  if (job.status !== "approved") {
    throw new Error("Only an approved piece can be published.");
  }
  return { text: job.edited_output ?? job.output, mediaUrls: [] };
}

export async function sendPublication(pub: Publication): Promise<Publication> {
  try {
    const { text, mediaUrls } = await resolveContent(pub);
    const connection = pub.channel_connection_id
      ? (await list("channel_connection")).find(
          (c) => c.id === pub.channel_connection_id,
        ) ?? null
      : null;

    const adapter = resolveDeliveryAdapter(pub.channel);
    const { externalRef } = await adapter.deliver({
      content: text,
      connection,
      platform: pub.channel,
      mediaUrls,
    });

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
  jobId?: string | null;
  productionId?: string | null;
  connectionId?: string | null;
  platform?: string;
  scheduledFor?: string | null;
}

export async function createPublication(
  input: CreatePublicationInput,
): Promise<Publication> {
  if (!input.jobId && !input.productionId) {
    throw new Error("jobId or productionId is required.");
  }

  let platform = input.platform ?? "manual";
  if (input.connectionId) {
    const conn = (await list("channel_connection")).find(
      (c) => c.id === input.connectionId,
    );
    if (!conn) throw new Error("Channel connection not found.");
    platform = conn.platform;
  }

  const ts = nowIso();
  const scheduledFor = input.scheduledFor ?? null;
  const pub: Publication = {
    id: newId(),
    job_id: input.jobId ?? null,
    production_id: input.productionId ?? null,
    channel: platform,
    channel_connection_id: input.connectionId ?? null,
    media_urls: "[]",
    status: "scheduled",
    scheduled_for: scheduledFor,
    external_ref: null,
    error: null,
    created_at: ts,
    updated_at: ts,
  };
  // Validate the source is approved up front (throws before insert).
  await resolveContent(pub);
  const created = await insert("publication", pub);

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
