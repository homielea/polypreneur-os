import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { getSetting, setSetting } from "@/lib/db";

export const dynamic = "force-dynamic";

export type ScribeCadence = "on_demand" | "daily";

const KEY = "scribe_cadence";
const DEFAULT: ScribeCadence = "on_demand";

export function GET() {
  return handler(async () => ({
    cadence: await getSetting<ScribeCadence>(KEY, DEFAULT),
  }));
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { cadence?: ScribeCadence };
  if (body.cadence !== "on_demand" && body.cadence !== "daily") {
    return badRequest("cadence must be 'on_demand' or 'daily'.");
  }
  return handler(async () => {
    await setSetting(KEY, body.cadence);
    return { cadence: body.cadence };
  });
}
