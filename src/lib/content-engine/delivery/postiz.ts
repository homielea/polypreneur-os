/**
 * Postiz delivery adapter — self-hosted multi-platform aggregator (the OSS path,
 * e.g. on Railway). Config-bound factory.
 *
 * Posts via POST {apiUrl}/public/v1/posts with header `Authorization: {apiKey}`.
 * In Postiz a "channel" is an "integration"; store the channel's Postiz
 * integration id in the connection's `handle`.
 *
 * v1 posts text immediately (type: "now"). Media (faceless video) needs a Postiz
 * upload step to get a media id first — not wired yet, so a publication with a
 * video errors clearly (route video channels to Blotato, or wire upload later).
 */

import type { DeliveryAdapter } from "./types";

export function makePostizAdapter(cfg: {
  apiUrl: string;
  apiKey: string;
}): DeliveryAdapter {
  const base = cfg.apiUrl.replace(/\/+$/, "");
  return {
    key: "postiz",
    async deliver({ content, connection, platform, mediaUrls }) {
      const integrationId = connection?.handle?.trim();
      if (!integrationId) {
        throw new Error(
          `This ${platform} channel has no Postiz integration id. Put it in the channel's handle (GET ${base}/public/v1/integrations).`,
        );
      }
      if (mediaUrls && mediaUrls.length > 0) {
        throw new Error(
          "Postiz media upload isn't wired yet — route video channels to Blotato, or upload the asset to Postiz first.",
        );
      }

      const res = await fetch(`${base}/public/v1/posts`, {
        method: "POST",
        headers: {
          authorization: cfg.apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: "now",
          date: new Date().toISOString(),
          shortLink: false,
          tags: [],
          posts: [
            {
              integration: { id: integrationId },
              value: [{ content, image: [] }],
              settings: {},
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Postiz API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        postId?: string;
        [k: string]: unknown;
      };
      const first = Array.isArray(data) ? (data[0] as { id?: string }) : undefined;
      return { externalRef: data.id ?? data.postId ?? first?.id ?? "submitted" };
    },
  };
}
