/**
 * Webhook delivery adapter — hands an approved piece to YOUR OWN pipeline
 * (n8n / Make / a script / whatever posts to the networks). One generic outbound
 * instead of bundling social-media aggregators in here.
 *
 * Config-bound factory. POSTs a clean JSON payload to CONTENT_WEBHOOK_URL; an
 * optional CONTENT_WEBHOOK_SECRET is sent as a Bearer token. Your pipeline reads
 * `platform` + `channel.handle` to know where to post, and `content` / `mediaUrls`
 * for what to post.
 */

import type { DeliveryAdapter } from "./types";

export function makeWebhookAdapter(cfg: {
  url: string;
  secret?: string;
}): DeliveryAdapter {
  return {
    key: "webhook",
    async deliver({ content, connection, platform, mediaUrls }) {
      const res = await fetch(cfg.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(cfg.secret ? { authorization: `Bearer ${cfg.secret}` } : {}),
        },
        body: JSON.stringify({
          platform,
          channel: connection
            ? {
                id: connection.id,
                handle: connection.handle,
                displayName: connection.display_name,
                ventureId: connection.venture_id,
              }
            : null,
          content,
          mediaUrls: mediaUrls ?? [],
        }),
      });
      if (!res.ok) {
        throw new Error(`Webhook ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        externalRef?: string;
      };
      return { externalRef: data.externalRef ?? data.id ?? "sent" };
    },
  };
}
