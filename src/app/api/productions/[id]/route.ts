import { type NextRequest } from "next/server";
import { badRequest, handler } from "@/lib/api";
import { remove } from "@/lib/db";
import { createEngineContext } from "@/lib/engine";
import {
  generatePackage,
  renderProduction,
  updateProduction,
} from "@/lib/content-engine/video/productions";
import type { VideoProduction } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Production actions + edits. Approval is an explicit operator step — nothing the
 * Producer makes is distributed without it.
 *   action: generate | render | approve | reject | reset
 *   (or send title/voiceover_script/thumbnail_concept edits with no action)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: "generate" | "render" | "approve" | "reject" | "reset";
    backend?: string;
    title?: string;
    voiceover_script?: string;
    thumbnail_concept?: string;
  };
  const ctx = createEngineContext();

  switch (body.action) {
    case "generate":
      return handler(() => generatePackage(ctx, params.id));
    case "render":
      return handler(() => renderProduction(ctx, params.id, body.backend));
    case "approve":
      return handler(() =>
        updateProduction(ctx, params.id, { ...editFields(body), status: "approved" }),
      );
    case "reject":
      return handler(() => updateProduction(ctx, params.id, { status: "rejected" }));
    case "reset":
      return handler(() => updateProduction(ctx, params.id, { status: "draft" }));
    case undefined: {
      const edits = editFields(body);
      if (Object.keys(edits).length === 0) return badRequest("Nothing to update.");
      return handler(() => updateProduction(ctx, params.id, edits));
    }
    default:
      return badRequest("Unknown action.");
  }
}

function editFields(body: Partial<VideoProduction>): Partial<VideoProduction> {
  const out: Partial<VideoProduction> = {};
  if (typeof body.title === "string") out.title = body.title;
  if (typeof body.voiceover_script === "string")
    out.voiceover_script = body.voiceover_script;
  if (typeof body.thumbnail_concept === "string")
    out.thumbnail_concept = body.thumbnail_concept;
  return out;
}

export function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handler(async () => {
    await remove("video_production", params.id);
    return { ok: true };
  });
}
