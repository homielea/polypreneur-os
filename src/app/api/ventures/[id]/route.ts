import { type NextRequest } from "next/server";
import { handler } from "@/lib/api";
import { remove, update } from "@/lib/db";
import { setVentureStatus } from "@/lib/ventures";
import type { VentureStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as {
    status?: VentureStatus;
    name?: string;
  };
  return handler(async () => {
    if (body.status) {
      // routed through the cap-enforcing helper
      return setVentureStatus(params.id, body.status);
    }
    if (typeof body.name === "string") {
      return update("venture", params.id, { name: body.name.trim() });
    }
    return { ok: true };
  });
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("venture", params.id);
    return { ok: true };
  });
}
