/**
 * Resolve which delivery backend handles a platform, given current config.
 *
 *   manual / substack / unknown  -> mark as posted (placeholder)
 *   beehiiv                       -> Beehiiv (real; throws if unconfigured)
 *   social/video networks         -> Blotato when configured, else mark as posted
 *
 * This is the single place the Blotato-vs-Postiz (or any other) backend choice
 * lives. Swapping the delivery backend is editing this file + one adapter.
 */

import "server-only";
import { hasBlotato } from "@/lib/env";
import { beehiivAdapter } from "./beehiiv";
import { blotatoAdapter, isBlotatoBacked } from "./blotato";
import { markPostedAdapter } from "./mark-posted";
import type { DeliveryAdapter } from "./types";

export function resolveDeliveryAdapter(platform: string): DeliveryAdapter {
  if (platform === "beehiiv") return beehiivAdapter;
  if (isBlotatoBacked(platform) && hasBlotato) return blotatoAdapter;
  return markPostedAdapter;
}

/** True when a platform has a real delivery backend wired right now. */
export function platformDeliversLive(platform: string): boolean {
  if (platform === "beehiiv") return true; // adapter present (may still need creds)
  return isBlotatoBacked(platform) && hasBlotato;
}
