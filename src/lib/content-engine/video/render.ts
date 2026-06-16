/**
 * Video render seam. Takes an approved production package (voiceover + scenes)
 * and returns a hosted video asset URL. Rendering (TTS + b-roll + stitching) is
 * a commodity delegated to a backend — Blotato's faceless video or vidIQ later.
 *
 * v1 ships a STUB backend that returns a clearly-marked placeholder URL so the
 * pipeline (and the mediaUrls distribution path) is exercisable end-to-end
 * without a render vendor. Swapping in a real backend is one function here.
 */

import "server-only";
import type { ProductionPackage } from "./producer";

export interface RenderResult {
  videoUrl: string;
  backend: string;
}

export async function renderVideo(
  pkg: ProductionPackage,
): Promise<RenderResult> {
  // Placeholder render — real TTS+stitching is delegated (Blotato/vidIQ).
  const slug = encodeURIComponent(pkg.title.slice(0, 40) || "faceless");
  return {
    videoUrl: `https://example.invalid/faceless/${slug}.mp4`,
    backend: "stub",
  };
}
