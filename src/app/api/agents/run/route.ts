import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { list } from "@/lib/db";
import { runJob } from "@/lib/agents/run";

export const dynamic = "force-dynamic";

/**
 * Run pending agent jobs on-demand. With a `jobId`, runs that one; otherwise
 * runs every pending job (Scribe or Repurposer). Drafts land in
 * `awaiting_approval` — nothing ships without the operator's approval.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { jobId?: string };
  return handler(async () => {
    const jobs = await list("agent_job");
    const pending = jobs.filter(
      (j) => j.status === "pending" && (!body.jobId || j.id === body.jobId),
    );
    const results = [];
    for (const job of pending) {
      const updated = await runJob(job);
      results.push({
        id: updated.id,
        agent: updated.agent,
        status: updated.status,
        error: updated.error,
      });
    }
    return { ran: results.length, results };
  });
}
