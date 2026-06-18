import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { remove, update } from "@/lib/db";
import type { Idea } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as Partial<Idea>;
  const patch: Partial<Idea> = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.note === "string") patch.note = body.note.trim();
  if (body.status) patch.status = body.status;
  return handler(() => update("idea", params.id, patch));
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("idea", params.id);
    return { ok: true };
  });
}
