/**
 * HeyGen render backend — avatar / UGC faceless video (async submit + poll).
 *
 * render(): POST /v2/video/generate with the voiceover script read by a
 * configured avatar + voice; returns the video_id as a pending job.
 * poll():   GET /v1/video_status.get?video_id=... until completed; returns the
 *           hosted video_url.
 *
 * Requires HEYGEN_API_KEY + HEYGEN_AVATAR_ID + HEYGEN_VOICE_ID (list them via
 * GET /v2/avatars and GET /v2/voices). Auth header: X-Api-Key.
 *
 * Note: HeyGen's v2 "AI Studio (Legacy)" endpoints are stable today but slated
 * for deprecation toward newer API versions — revisit the body if a call 4xxs.
 */

import type { RenderBackend, RenderResult } from "./types";

const API = "https://api.heygen.com";

export const heygenRender: RenderBackend = {
  key: "heygen",
  label: "HeyGen (avatar / UGC)",
  wired: true,
  note: "Avatar/UGC video. Needs HEYGEN_API_KEY + HEYGEN_AVATAR_ID + HEYGEN_VOICE_ID.",
  isConfigured: (config) => Boolean(config.heygen?.apiKey),

  async render(input, config): Promise<RenderResult> {
    const cfg = config.heygen;
    if (!cfg?.apiKey) throw new Error("HeyGen is not configured.");
    if (!cfg.avatarId || !cfg.voiceId) {
      throw new Error(
        "Set HEYGEN_AVATAR_ID and HEYGEN_VOICE_ID (from GET /v2/avatars and /v2/voices).",
      );
    }

    const res = await fetch(`${API}/v2/video/generate`, {
      method: "POST",
      headers: { "x-api-key": cfg.apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: cfg.avatarId,
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: input.voiceoverScript,
              voice_id: cfg.voiceId,
            },
          },
        ],
        dimension: { width: cfg.width ?? 720, height: cfg.height ?? 1280 },
      }),
    });

    if (!res.ok) {
      throw new Error(`HeyGen generate ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const data = (await res.json().catch(() => ({}))) as {
      data?: { video_id?: string };
      error?: unknown;
    };
    const videoId = data.data?.video_id;
    if (!videoId) {
      throw new Error(`HeyGen returned no video_id: ${JSON.stringify(data).slice(0, 200)}`);
    }
    return { status: "pending", jobId: videoId, backend: "heygen" };
  },

  async poll(jobId, config): Promise<RenderResult> {
    const cfg = config.heygen;
    if (!cfg?.apiKey) throw new Error("HeyGen is not configured.");

    const res = await fetch(
      `${API}/v1/video_status.get?video_id=${encodeURIComponent(jobId)}`,
      { headers: { "x-api-key": cfg.apiKey } },
    );
    if (!res.ok) {
      throw new Error(`HeyGen status ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const data = (await res.json().catch(() => ({}))) as {
      data?: { status?: string; video_url?: string; error?: unknown };
    };
    const status = data.data?.status;
    if (status === "completed" && data.data?.video_url) {
      return { status: "ready", videoUrl: data.data.video_url, backend: "heygen" };
    }
    if (status === "failed") {
      throw new Error(
        `HeyGen render failed: ${JSON.stringify(data.data?.error ?? {}).slice(0, 200)}`,
      );
    }
    return { status: "pending", jobId, backend: "heygen" };
  },
};
