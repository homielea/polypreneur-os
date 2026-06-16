import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list, nowIso, remove, update } from "@/lib/db";
import type { AgentJob } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * The human approval gate. Every transition out of `awaiting_approval` is an
 * explicit operator action — nothing an agent produces is acted on without it.
 *   - edit    : save operator edits to the draft (stays awaiting_approval)
 *   - approve : mark approved (ready to flow to the content engine)
 *   - reject  : discard
 *   - reset   : send back to pending to re-run the Scribe
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: "edit" | "approve" | "reject" | "reset";
    edited_output?: string;
  };

  const jobs = await list("agent_job");
  const job = jobs.find((j) => j.id === params.id);
  if (!job) return badRequest("Job not found.");

  let patch: Partial<AgentJob> = { updated_at: nowIso() };
  switch (body.action) {
    case "edit":
      patch.edited_output = body.edited_output ?? "";
      break;
    case "approve":
      if (typeof body.edited_output === "string") {
        patch.edited_output = body.edited_output;
      }
      patch.status = "approved";
      break;
    case "reject":
      patch.status = "rejected";
      break;
    case "reset":
      patch.status = "pending";
      patch.error = null;
      break;
    default:
      return badRequest("Unknown action.");
  }

  return handler(() => update("agent_job", params.id, patch));
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("agent_job", params.id);
    return { ok: true };
  });
}
