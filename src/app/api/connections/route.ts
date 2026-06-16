import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { insert, list, newId, nowIso } from "@/lib/db";
import { platformDef } from "@/lib/distribution/platforms";
import type { ChannelConnection, ConnectionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => {
    const connections = await list("channel_connection");
    connections.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return connections;
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<ChannelConnection>;
  if (!body.platform) return badRequest("platform is required.");
  const def = platformDef(body.platform);
  const conn: ChannelConnection = {
    id: newId(),
    venture_id: body.venture_id ?? null,
    platform: body.platform,
    display_name: body.display_name?.trim() || def.label,
    handle: body.handle?.trim() ?? "",
    // Real OAuth isn't wired in v1 — connections start as placeholders.
    status: (body.status as ConnectionStatus) ?? "placeholder",
    created_at: nowIso(),
  };
  return handler(() => insert("channel_connection", conn));
}
