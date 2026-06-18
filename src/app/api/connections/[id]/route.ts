import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { remove, update } from "@/lib/db";
import type { ChannelConnection } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as Partial<ChannelConnection>;
  const patch: Partial<ChannelConnection> = {};
  if (typeof body.display_name === "string") patch.display_name = body.display_name.trim();
  if (typeof body.handle === "string") patch.handle = body.handle.trim();
  if (typeof body.delivery_backend === "string")
    patch.delivery_backend = body.delivery_backend;
  if (body.status) patch.status = body.status;
  if ("venture_id" in body) patch.venture_id = body.venture_id ?? null;
  return handler(() => update("channel_connection", params.id, patch));
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("channel_connection", params.id);
    return { ok: true };
  });
}
