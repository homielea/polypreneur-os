import type { RenderBackend } from "./types";

/**
 * HeyGen — avatar / UGC faceless video. Scaffolded seam (not yet wired).
 *
 * Wiring sketch (when ready): POST https://api.heygen.com/v2/video/generate with
 * `X-Api-Key: <key>` and a payload mapping the voiceover script to a voice and
 * the scenes to scene inputs; HeyGen returns a video_id you then poll
 * (GET /v1/video_status.get) until the asset URL is ready. Replace the throw
 * below with that call + poll, returning { videoUrl, backend: "heygen" }.
 */
export const heygenRender: RenderBackend = {
  key: "heygen",
  label: "HeyGen (avatar / UGC)",
  wired: false,
  note: "Avatar & UGC video. Key detected; API wiring pending.",
  isConfigured: (config) => Boolean(config.heygenApiKey),
  async render() {
    throw new Error("HeyGen render backend is scaffolded but not yet wired.");
  },
};
