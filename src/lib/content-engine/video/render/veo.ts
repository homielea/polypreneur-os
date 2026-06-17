import type { RenderBackend } from "./types";

/**
 * Google Veo 3 — generative video. Scaffolded seam (not yet wired).
 * Wiring sketch: call the Veo generate endpoint with scene prompts, poll the
 * long-running operation, then assemble + add voiceover. Replace the throw with
 * that flow, returning backend: "veo".
 */
export const veoRender: RenderBackend = {
  key: "veo",
  label: "Veo 3 (generative video)",
  wired: false,
  note: "Generative video. Key detected; API wiring pending.",
  isConfigured: (config) => Boolean(config.veoApiKey),
  async render() {
    throw new Error("Veo render backend is scaffolded but not yet wired.");
  },
};
