import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { insert, list, newId } from "@/lib/db";
import type { InversionTag, Task, TaskStatus, WorkType } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => list("task"));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Task>;
  if (!body.venture_id) return badRequest("venture_id is required.");
  if (!body.title?.trim()) return badRequest("title is required.");
  const task: Task = {
    id: newId(),
    venture_id: body.venture_id,
    title: body.title.trim(),
    inversion_tag: (body.inversion_tag as InversionTag) ?? "execution",
    status: (body.status as TaskStatus) ?? "todo",
    work_type: (body.work_type as WorkType) ?? "other",
    due_date: body.due_date ?? null,
    leverage_score: null,
  };
  return handler(() => insert("task", task));
}
