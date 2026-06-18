/**
 * Resolve which delivery backend handles a platform, given engine config and the
 * channel's preferred backend.
 *
 *   manual / substack / unknown  -> mark as posted (placeholder)
 *   beehiiv                       -> Beehiiv (real; fails if unconfigured)
 *   social/video networks         -> the channel's chosen aggregator:
 *       'blotato' | 'postiz' | 'mark_posted', or 'auto'
 *       (auto = first configured of Blotato, Postiz, else mark-as-posted)
 *
 * The single place the delivery-backend choice lives. Adding/swapping an
 * aggregator (Blotato, self-hosted Postiz, …) is one adapter + a branch here.
 */

import type { EngineConfig } from "@/lib/content-engine/ports";
import { makeBeehiivAdapter } from "./beehiiv";
import { isBlotatoBacked, makeBlotatoAdapter } from "./blotato";
import { makePostizAdapter } from "./postiz";
import { markPostedAdapter } from "./mark-posted";
import type { DeliveryAdapter } from "./types";

/** Channels that route to a social/video aggregator (not newsletter/manual). */
function isAggregatorPlatform(platform: string): boolean {
  return platform !== "manual" && platform !== "beehiiv" && platform !== "substack";
}

function pick(
  config: EngineConfig,
  backend: string,
  platform: string,
): DeliveryAdapter | null {
  if (backend === "postiz") {
    return config.postiz ? makePostizAdapter(config.postiz) : null;
  }
  if (backend === "blotato") {
    return isBlotatoBacked(platform) && config.blotatoApiKey
      ? makeBlotatoAdapter(config.blotatoApiKey)
      : null;
  }
  if (backend === "mark_posted") return markPostedAdapter;
  return null;
}

export function resolveDeliveryAdapter(
  config: EngineConfig,
  platform: string,
  preferred: string = "auto",
): DeliveryAdapter {
  if (platform === "beehiiv") return makeBeehiivAdapter(config.beehiiv);
  if (!isAggregatorPlatform(platform)) return markPostedAdapter;

  if (preferred && preferred !== "auto") {
    const chosen = pick(config, preferred, platform);
    if (chosen) return chosen;
    // requested backend isn't configured — fall through to auto
  }
  return (
    pick(config, "blotato", platform) ??
    pick(config, "postiz", platform) ??
    markPostedAdapter
  );
}

/** Backends that are configured right now (for status display). */
export function configuredBackends(config: EngineConfig): string[] {
  const out: string[] = [];
  if (config.blotatoApiKey) out.push("blotato");
  if (config.postiz) out.push("postiz");
  if (config.beehiiv) out.push("beehiiv");
  return out;
}
