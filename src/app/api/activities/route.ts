import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { insert, list, newId, today } from "@/lib/db";
import type { Activity, ActivityType } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const activities = await list("activity");
    activities.sort((a, b) => b.date.localeCompare(a.date));
    return activities;
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Activity>;
  if (!body.venture_id) return badRequest("venture_id is required.");
  const activity: Activity = {
    id: newId(),
    venture_id: body.venture_id,
    date: body.date ?? today(),
    type: (body.type as ActivityType) ?? "manual",
    source: body.source ?? "manual",
    magnitude: typeof body.magnitude === "number" ? body.magnitude : 1,
  };
  return handler(() => insert("activity", activity));
}
