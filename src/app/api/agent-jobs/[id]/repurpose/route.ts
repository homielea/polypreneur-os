import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list } from "@/lib/db";
import { enqueueRepurpose } from "@/lib/agents/repurposer/enqueue";

export const dynamic = "force-dynamic";

/** Fan an approved Scribe piece out into Repurposer jobs (one per format). */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const job = (await list("agent_job")).find((j) => j.id === params.id);
  if (!job) return badRequest("Job not found.");
  return handler(() => enqueueRepurpose(job));
}
