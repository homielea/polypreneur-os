/**
 * The Scribe agent runner. Takes a pending agent_job, drafts a Lea's Lessons
 * script from its source text, and moves the job to `awaiting_approval`.
 *
 * NOTHING the Scribe produces ships automatically — a draft only ever lands in
 * the approval inbox. The operator approves/edits/rejects (§3.2, §5.2). This is
 * the whole point of the POC: source → agent → draft → human approval.
 */

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env, hasAnthropic } from "@/lib/env";
import { nowIso, update } from "@/lib/db";
import type { AgentJob } from "@/lib/types";
import { SCRIBE_SYSTEM_PROMPT, stubDraft } from "./prompt";

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.anthropicKey });
  return client;
}

/** Draft from source text. Uses Claude when configured, else the local stub. */
export async function draftLeasLesson(source: string): Promise<string> {
  if (!hasAnthropic) {
    return stubDraft(source);
  }
  const message = await anthropic().messages.create({
    model: env.anthropicModel,
    max_tokens: 4000,
    system: SCRIBE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the raw voice note / check-in to turn into a Lea's Lessons script:\n\n${source}`,
      },
    ],
  });
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!text) throw new Error("Scribe returned an empty draft.");
  return text;
}

/** Process one pending job in place, persisting the result/error. */
export async function runScribeJob(job: AgentJob): Promise<AgentJob> {
  try {
    const output = await draftLeasLesson(job.input_text);
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
