import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { list } from "@/lib/db";
import { createPublication } from "@/lib/distribution/publish";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const publications = await list("publication");
    publications.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { publications };
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    jobId?: string;
    productionId?: string;
    connectionId?: string | null;
    platform?: string;
    scheduledFor?: string | null;
  };
  if (!body.jobId && !body.productionId) {
    return badRequest("jobId or productionId is required.");
  }
  if (!body.connectionId && !body.platform) {
    return badRequest("connectionId or platform is required.");
  }
  return handler(() =>
    createPublication({
      jobId: body.jobId ?? null,
      productionId: body.productionId ?? null,
      connectionId: body.connectionId ?? null,
      platform: body.platform,
      scheduledFor: body.scheduledFor ?? null,
    }),
  );
}
