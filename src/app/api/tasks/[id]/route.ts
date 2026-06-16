import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { remove, update } from "@/lib/db";
import type { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

const EDITABLE: (keyof Task)[] = [
  "title",
  "inversion_tag",
  "status",
  "work_type",
  "due_date",
  "venture_id",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as Partial<Task>;
  const patch: Partial<Task> = {};
  for (const key of EDITABLE) {
    if (key in body) (patch as Record<string, unknown>)[key] = body[key];
  }
  return handler(() => update("task", params.id, patch));
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("task", params.id);
    return { ok: true };
  });
}
