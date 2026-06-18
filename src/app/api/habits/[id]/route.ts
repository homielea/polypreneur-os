import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { remove, update } from "@/lib/db";
import type { Habit } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as Partial<Habit>;
  const patch: Partial<Habit> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.target === "string") patch.target = body.target.trim();
  return handler(() => update("habit", params.id, patch));
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("habit", params.id);
    return { ok: true };
  });
}
