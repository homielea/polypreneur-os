import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { runWorkflow, type WorkflowOptions } from "@/lib/workflow";

export const dynamic = "force-dynamic";

/**
 * Run the gated content workflow. Defaults to scan + draft. Pass advance flags to
 * push approved pieces to the next stage's drafts. Never approves or publishes —
 * those gates stay human.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<WorkflowOptions>;
  const opts: WorkflowOptions = {
    intake: body.intake ?? true,
    draft: body.draft ?? true,
    advanceRepurpose: body.advanceRepurpose ?? false,
    advanceVideo: body.advanceVideo ?? false,
  };
  return handler(() => runWorkflow(opts));
}
