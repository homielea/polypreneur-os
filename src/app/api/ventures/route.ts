import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list } from "@/lib/db";
import { countActive, createVenture } from "@/lib/ventures";
import type { VentureStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const ventures = await list("venture");
    ventures.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return { ventures, focus: countActive(ventures) };
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    status?: VentureStatus;
  };
  if (!body.name?.trim()) return badRequest("Venture name is required.");
  const status = body.status ?? "experiment";
  return handler(() => createVenture(body.name as string, status));
}
