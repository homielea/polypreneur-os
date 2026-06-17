import type { RenderBackend } from "./types";

/** The functional default: a clearly-marked placeholder asset so the pipeline
 *  runs end-to-end without a render vendor. */
export const stubRender: RenderBackend = {
  key: "stub",
  label: "Stub (placeholder)",
  wired: true,
  note: "Returns a placeholder URL so the pipeline is testable without a vendor.",
  isConfigured: () => true,
  async render(input) {
    const slug = encodeURIComponent(input.title.slice(0, 40) || "faceless");
    return { videoUrl: `https://example.invalid/faceless/${slug}.mp4`, backend: "stub" };
  },
};
