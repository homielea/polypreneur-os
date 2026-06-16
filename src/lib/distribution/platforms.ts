/**
 * Platform registry. Channels are connections to these platforms. Most are
 * PLACEHOLDERS in v1 — the operator surface + per-venture routing without the
 * real OAuth. Real multi-network delivery is a future single adapter (e.g.
 * self-hosted Postiz), not 15 integrations built here.
 *
 * `adapter` says how a send is actually performed:
 *   - beehiiv     : real draft-create via the Beehiiv API
 *   - manual      : "mark as posted" — the operator confirms they posted it
 *   - placeholder : same as manual for now (mark as posted), pending an adapter
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
