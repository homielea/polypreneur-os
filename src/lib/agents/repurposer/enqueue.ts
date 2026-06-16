/**
 * Fan an approved Lea's Lesson out into Repurposer jobs — one per derivative
 * format, each its own approval-gated job.
 *
 * In v1 this is triggered by the operator (the human is still the router). In v2
 * an approved Scribe draft can auto-spawn these — the agent-to-agent step — but
 * the approval gate on each derivative stays.
 */

import "server-only";
import { insert, list, newId, nowIso } from "@/lib/db";
import type { AgentJob } from "@/lib/types";
import { ALL_FORMATS } from "./prompt";

export interface RepurposeResult {
  created: number;
  skippedExisting: number;
}

export async function enqueueRepurpose(
  scribeJob: AgentJob,
): Promise<RepurposeResult> {
  if (scribeJob.agent !== "scribe") {
    throw new Error("Only an approved Scribe piece can be repurposed.");
  }
  if (scribeJob.status !== "approved") {
    throw new Error("Approve the piece before repurposing it.");
  }

  const source = scribeJob.edited_output ?? scribeJob.output;
  const inputRef = `job:${scribeJob.id}`;
  const existing = await list("agent_job");

  let created = 0;
  let skippedExisting = 0;
  for (const format of ALL_FORMATS) {
    const dup = existing.some(
      (j) => j.input_ref === inputRef && j.format === format,
    );
    if (dup) {
      skippedExisting++;
      continue;
    }
    const ts = nowIso();
    const job: AgentJob = {
      id: newId(),
      agent: "repurposer",
      format,
      input_ref: inputRef,
      input_text: source,
      output: "",
      edited_output: null,
      status: "pending",
      error: null,
      created_at: ts,
      updated_at: ts,
    };
    await insert("agent_job", job);
    created++;
  }
  return { created, skippedExisting };
}
