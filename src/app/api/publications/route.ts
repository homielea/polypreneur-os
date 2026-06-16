import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list } from "@/lib/db";
import { channelCatalog } from "@/lib/distribution/channels";
import { createPublication } from "@/lib/distribution/publish";
import type { Channel } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const publications = await list("publication");
    publications.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { publications, channels: channelCatalog() };
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    jobId?: string;
    channel?: Channel;
    scheduledFor?: string | null;
  };
  if (!body.jobId) return badRequest("jobId is required.");
  if (!body.channel) return badRequest("channel is required.");
  return handler(() =>
    createPublication({
      jobId: body.jobId as string,
      channel: body.channel as Channel,
      scheduledFor: body.scheduledFor ?? null,
    }),
  );
}
