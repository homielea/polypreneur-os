/**
 * Platform registry. Channels are connections to these platforms; the operator
 * surface + per-venture routing. Actual outbound delivery is decided by the
 * delivery registry (webhook to your own pipeline, Beehiiv draft, or mark-as-
 * posted) — not by social-media aggregators bundled here.
 *
 * `adapter`/`kind` are informational labels for the UI; the delivery registry is
 * authoritative for how a send happens.
 */

export type PlatformKind = "newsletter" | "social" | "video" | "manual";
export type SendAdapter = "beehiiv" | "manual" | "placeholder";

export interface PlatformDef {
  key: string;
  label: string;
  kind: PlatformKind;
  adapter: SendAdapter;
  note?: string;
}

export const PLATFORMS: Record<string, PlatformDef> = {
  manual: { key: "manual", label: "Manual", kind: "manual", adapter: "manual" },
  beehiiv: {
    key: "beehiiv",
    label: "Beehiiv",
    kind: "newsletter",
    adapter: "beehiiv",
    note: "Creates a draft post — you hit send in Beehiiv.",
  },
  substack: {
    key: "substack",
    label: "Substack",
    kind: "newsletter",
    adapter: "placeholder",
    note: "No public write API — mark as posted / draft in Substack manually.",
  },
  x: { key: "x", label: "X / Twitter", kind: "social", adapter: "placeholder" },
  linkedin: { key: "linkedin", label: "LinkedIn", kind: "social", adapter: "placeholder" },
  instagram: { key: "instagram", label: "Instagram", kind: "social", adapter: "placeholder" },
  threads: { key: "threads", label: "Threads", kind: "social", adapter: "placeholder" },
  bluesky: { key: "bluesky", label: "Bluesky", kind: "social", adapter: "placeholder" },
  mastodon: { key: "mastodon", label: "Mastodon", kind: "social", adapter: "placeholder" },
  youtube: { key: "youtube", label: "YouTube", kind: "video", adapter: "placeholder" },
  tiktok: { key: "tiktok", label: "TikTok", kind: "video", adapter: "placeholder" },
};

export const PLATFORM_LIST: PlatformDef[] = Object.values(PLATFORMS);

export function platformDef(key: string): PlatformDef {
  return (
    PLATFORMS[key] ?? {
      key,
      label: key,
      kind: "social",
      adapter: "placeholder",
    }
  );
}
