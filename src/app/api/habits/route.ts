import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { insert, list, newId } from "@/lib/db";
import type { Habit } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => list("habit"));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Habit>;
  if (!body.name?.trim()) return badRequest("Habit name is required.");
  const habit: Habit = {
    id: newId(),
    name: body.name.trim(),
    target: body.target?.trim() ?? "",
  };
  return handler(() => insert("habit", habit));
}
