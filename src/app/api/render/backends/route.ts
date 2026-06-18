import { handler } from "@/lib/api";
import { engineConfig } from "@/lib/engine";
import { listRenderBackends } from "@/lib/content-engine/video/render/registry";

export const dynamic = "force-dynamic";

/** Faceless-video render backends and their wiring/config state. */
export function GET() {
  return handler(async () => ({
    backends: listRenderBackends(engineConfig()),
  }));
}
