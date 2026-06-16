import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { list, update } from "@/lib/db";
import { createVenture } from "@/lib/ventures";
import type { VentureStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Promote a vault idea into an active venture. Subject to the focus cap — if
 * full, createVenture throws FocusCapError (409) and the idea stays in the
 * vault, exactly as the 80/20 Enforcer intends.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as {
    status?: VentureStatus;
  };
  const status = body.status === "primary" ? "primary" : "experiment";
  return handler(async () => {
    const idea = (await list("idea")).find((i) => i.id === params.id);
    if (!idea) throw new Error("Idea not found.");
    const venture = await createVenture(idea.title, status);
    await update("idea", idea.id, { status: "promoted" });
    return { venture };
  });
}
