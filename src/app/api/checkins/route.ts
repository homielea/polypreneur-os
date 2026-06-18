import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { insert, list, newId, today, update } from "@/lib/db";
import type { Checkin } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const checkins = await list("checkin");
    checkins.sort((a, b) => b.date.localeCompare(a.date));
    return checkins;
  });
}

/** Upsert by date: one check-in per day on the shared date axis. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Checkin>;
  const date = body.date ?? today();
  return handler(async () => {
    const existing = (await list("checkin")).find((c) => c.date === date);
    const fields = {
      date,
      emotional_state: body.emotional_state ?? existing?.emotional_state ?? "",
      energy_level: body.energy_level ?? existing?.energy_level ?? 3,
      free_text: body.free_text ?? existing?.free_text ?? "",
      content_flag: body.content_flag ?? existing?.content_flag ?? false,
    };
    if (existing) return update("checkin", existing.id, fields);
    return insert("checkin", { id: newId(), ...fields } as Checkin);
  });
}
