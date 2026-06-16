import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { list } from "@/lib/db";
import { runScribeJob } from "@/lib/agents/scribe/run";

export const dynamic = "force-dynamic";

/**
 * Run the Scribe on-demand. With a `jobId`, processes that one pending job;
 * otherwise processes every pending job. Drafts land in `awaiting_approval` —
 * nothing ships without the operator's approval.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { jobId?: string };
  return handler(async () => {
    const jobs = await list("agent_job");
    const pending = jobs.filter(
      (j) =>
        j.status === "pending" && (!body.jobId || j.id === body.jobId),
    );
    const results = [];
    for (const job of pending) {
      const updated = await runScribeJob(job);
      results.push({ id: updated.id, status: updated.status, error: updated.error });
    }
    return { ran: results.length, results };
  });
}
