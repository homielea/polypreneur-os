import "server-only";
import { hasBeehiiv } from "@/lib/env";
import type { Channel } from "@/lib/types";

export interface ChannelInfo {
  key: Channel;
  label: string;
  available: boolean; // can actually send right now
  note: string;
}

/**
 * v1 channels. `manual` is always available (mark-as-exported — the operator
 * copies the piece out). `beehiiv` is a write integration, env-gated. `social`
 * is reserved/stubbed for a later phase.
 */
export function channelCatalog(): ChannelInfo[] {
  return [
    {
      key: "manual",
      label: "Manual (mark exported)",
      available: true,
      note: "Marks the piece shipped — you copy it into the channel yourself.",
    },
    {
      key: "beehiiv",
      label: "Beehiiv (newsletter draft)",
      available: hasBeehiiv,
      note: hasBeehiiv
        ? "Creates a DRAFT post in Beehiiv — you still hit send there."
        : "Set BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID to enable.",
    },
    {
      key: "social",
      label: "Social",
      available: false,
      note: "Stubbed in v1 — reserved for a later marketing phase.",
    },
  ];
}

export function isChannelAvailable(channel: Channel): boolean {
  return channelCatalog().find((c) => c.key === channel)?.available ?? false;
}
