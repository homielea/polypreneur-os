/**
 * Blotato delivery adapter — the multi-platform send backend.
 *
 * Config-bound factory (no env import): `makeBlotatoAdapter(apiKey)`. Maps our
 * platform keys to Blotato `targetType`s and posts via POST /v2/posts. The
 * channel's Blotato accountId (GET /v2/users/me/accounts) is in the connection's
 * `handle`. Best-effort against the documented v2 shape.
 */

import type { DeliveryAdapter } from "./types";

/** Our platform key -> Blotato targetType. Platforms absent here aren't Blotato-backed. */
export const BLOTATO_TARGETS: Record<string, string> = {
  x: "twitter",
  linkedin: "linkedin",
  instagram: "instagram",
  threads: "threads",
  bluesky: "bluesky",
  mastodon: "mastodon",
  youtube: "youtube",
  tiktok: "tiktok",
  facebook: "facebook",
};

export function isBlotatoBacked(platform: string): boolean {
  return platform in BLOTATO_TARGETS;
}

export function makeBlotatoAdapter(apiKey: string): DeliveryAdapter {
  return {
    key: "blotato",
    async deliver({ content, connection, platform, mediaUrls }) {
      const targetType = BLOTATO_TARGETS[platform];
      if (!targetType) throw new Error(`Blotato has no target for "${platform}".`);
      const accountId = connection?.handle?.trim();
      if (!accountId) {
        throw new Error(
          `This ${platform} channel has no Blotato accountId. Put it in the channel's handle (see GET /v2/users/me/accounts).`,
        );
      }

      const res = await fetch("https://backend.blotato.com/v2/posts", {
        method: "POST",
        headers: {
          "blotato-api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          post: {
            accountId,
            content: { text: content, mediaUrls: mediaUrls ?? [], platform: targetType },
            target: { targetType },
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Blotato API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        postId?: string;
        submissionId?: string;
        data?: { id?: string };
      };
      const ref =
        data.id ?? data.postId ?? data.submissionId ?? data.data?.id ?? "submitted";
      return { externalRef: ref };
    },
  };
}
