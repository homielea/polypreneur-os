import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list } from "@/lib/db";
import { createProduction } from "@/lib/content-engine/video/productions";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const productions = await list("video_production");
    productions.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return productions;
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { jobId?: string };
  if (!body.jobId) return badRequest("jobId is required.");
  return handler(() => createProduction(body.jobId as string));
}
