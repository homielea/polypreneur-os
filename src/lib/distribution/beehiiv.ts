/**
 * Beehiiv write adapter. Creates the approved piece as a DRAFT post — never an
 * auto-send. The final send stays a human action in Beehiiv (judgment at the
 * boundary). Env-gated by BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID.
 *
 * NOTE: Beehiiv's create-post API shape/availability varies by plan; if your
 * account rejects this, the publication is marked failed with the API error and
 * the request body here is the thing to adjust.
 */

import "server-only";
import { env, hasBeehiiv } from "@/lib/env";

export interface PublishResult {
  externalRef: string;
}

/** Derive a title from the first non-empty line; fall back to a default. */
function deriveTitle(content: string): string {
  const first = content.split("\n").find((l) => l.trim()) ?? "Lea's Lessons";
  return first.replace(/^subject:\s*/i, "").slice(0, 120);
}

export async function publishToBeehiiv(content: string): Promise<PublishResult> {
  if (!hasBeehiiv) {
    throw new Error("Beehiiv is not configured.");
  }
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${env.beehiivPublicationId}/posts`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.beehiivApiKey}`,
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
    const detail = await res.text().catch(() => "");
    throw new Error(`Beehiiv API ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = (await res.json().catch(() => ({}))) as {
    data?: { id?: string };
    id?: string;
  };
  const id = data.data?.id ?? data.id ?? "unknown";
  return { externalRef: id };
}
