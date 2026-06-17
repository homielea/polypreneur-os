import type { RenderBackend } from "./types";

/**
 * Runway — generative b-roll / video. Scaffolded seam (not yet wired).
 * Wiring sketch: POST to Runway's generations endpoint with the scene prompts as
 * generation inputs, poll the task, then assemble clips + voiceover into the
 * final asset. Replace the throw with that flow, returning backend: "runway".
 */
export const runwayRender: RenderBackend = {
  key: "runway",
  label: "Runway (generative b-roll)",
  wired: false,
  note: "Generative video/b-roll. Key detected; API wiring pending.",
  isConfigured: (config) => Boolean(config.runwayApiKey),
  async render() {
    throw new Error("Runway render backend is scaffolded but not yet wired.");
  },
};
