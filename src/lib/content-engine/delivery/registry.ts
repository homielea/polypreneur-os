/**
 * Resolve which delivery backend handles a platform, given engine config.
 *
 *   manual / substack / unknown  -> mark as posted (placeholder)
 *   beehiiv                       -> Beehiiv (real; fails if unconfigured)
 *   social/video networks         -> Blotato when configured, else mark as posted
 *
 * The single place the delivery-backend choice lives. Swapping Blotato for
 * self-hosted Postiz (or anything) is editing this file + one adapter.
 */

import type { EngineConfig } from "@/lib/content-engine/ports";
import { makeBeehiivAdapter } from "./beehiiv";
import { isBlotatoBacked, makeBlotatoAdapter } from "./blotato";
import { markPostedAdapter } from "./mark-posted";
import type { DeliveryAdapter } from "./types";

export function resolveDeliveryAdapter(
  config: EngineConfig,
  platform: string,
): DeliveryAdapter {
  if (platform === "beehiiv") return makeBeehiivAdapter(config.beehiiv);
  if (isBlotatoBacked(platform) && config.blotatoApiKey) {
    return makeBlotatoAdapter(config.blotatoApiKey);
  }
  return markPostedAdapter;
}

/** True when a platform has a real delivery backend wired right now. */
export function platformDeliversLive(
  config: EngineConfig,
  platform: string,
): boolean {
  if (platform === "beehiiv") return Boolean(config.beehiiv);
  return isBlotatoBacked(platform) && Boolean(config.blotatoApiKey);
}
