/**
 * Beehiiv newsletter delivery — creates a DRAFT post (never auto-send; the final
 * send stays human in Beehiiv). Config-bound factory; if creds are absent the
 * adapter fails honestly rather than pretending.
 *
 * NOTE: Beehiiv's create-post API shape/availability varies by plan; if your
 * account rejects this, the request body here is the thing to adjust.
 */

import type { DeliveryAdapter } from "./types";

function deriveTitle(content: string): string {
  const first = content.split("\n").find((l) => l.trim()) ?? "Lea's Lessons";
  return first.replace(/^subject:\s*/i, "").slice(0, 120);
}

export function makeBeehiivAdapter(
  cfg: { apiKey: string; publicationId: string } | undefined,
): DeliveryAdapter {
  return {
    key: "beehiiv",
    async deliver({ content }) {
      if (!cfg) throw new Error("Beehiiv is not configured.");
      const res = await fetch(
        `https://api.beehiiv.com/v2/publications/${cfg.publicationId}/posts`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${cfg.apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            title: deriveTitle(content),
            body_content: content,
            status: "draft",
          }),
        },
      );
      if (!res.ok) {
        throw new Error(`Beehiiv API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const data = (await res.json().catch(() => ({}))) as {
        data?: { id?: string };
        id?: string;
      };
      return { externalRef: data.data?.id ?? data.id ?? "unknown" };
    },
  };
}
