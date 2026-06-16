/**
 * Agent dispatcher. The job queue is one table; this routes a pending job to the
 * right agent runner. Adding an agent = adding a case here — the inbox, queue,
 * and approval gate are unchanged (§5.2: every new agent is a clone of the
 * pattern).
 */

import "server-only";
import type { AgentJob } from "@/lib/types";
import { runScribeJob } from "./scribe/run";
import { runRepurposerJob } from "./repurposer/run";

export function runJob(job: AgentJob): Promise<AgentJob> {
  switch (job.agent) {
    case "repurposer":
      return runRepurposerJob(job);
    case "scribe":
    default:
      return runScribeJob(job);
  }
}
