/**
 * The Repurposer runner. Drafts one derivative format from the source piece and
 * moves the job to `awaiting_approval` — same human-approval gate as the Scribe.
 */

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env, hasAnthropic } from "@/lib/env";
import { nowIso, update } from "@/lib/db";
import type { AgentJob, JobFormat } from "@/lib/types";
import { REPURPOSER_PROMPTS, stubRepurpose } from "./prompt";

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.anthropicKey });
  return client;
}

export async function draftDerivative(
  format: JobFormat,
  source: string,
): Promise<string> {
  if (!hasAnthropic) return stubRepurpose(format, source);
  const message = await anthropic().messages.create({
    model: env.anthropicModel,
    max_tokens: 2000,
    system: REPURPOSER_PROMPTS[format],
    messages: [
      {
        role: "user",
        content: `Here is the approved Lea's Lessons piece to repurpose:\n\n${source}`,
      },
    ],
  });
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!text) throw new Error("Repurposer returned an empty draft.");
  return text;
}

export async function runRepurposerJob(job: AgentJob): Promise<AgentJob> {
  if (!job.format) {
    return update("agent_job", job.id, {
      status: "pending",
      error: "Repurposer job is missing a target format.",
      updated_at: nowIso(),
    });
  }
  try {
    const output = await draftDerivative(job.format, job.input_text);
    return update("agent_job", job.id, {
      output,
      status: "awaiting_approval",
      error: null,
      updated_at: nowIso(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return update("agent_job", job.id, {
      status: "pending",
      error: message,
      updated_at: nowIso(),
    });
  }
}
