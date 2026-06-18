import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { insert, list, newId, today, update } from "@/lib/db";
import type { HabitLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => list("habit_log"));
}

/** Upsert a habit's value for a given day (shared date axis). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<HabitLog>;
  if (!body.habit_id) return badRequest("habit_id is required.");
  const date = body.date ?? today();
  const value = body.value ?? "";
  return handler(async () => {
    const existing = (await list("habit_log")).find(
      (l) => l.habit_id === body.habit_id && l.date === date,
    );
    if (existing) return update("habit_log", existing.id, { value });
    return insert("habit_log", {
      id: newId(),
      habit_id: body.habit_id as string,
      date,
      value,
    });
  });
}
