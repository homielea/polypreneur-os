/**
 * Resolve which delivery backend handles a platform, given engine config and the
 * channel's preferred backend.
 *
 *   manual / substack / unknown  -> mark as posted (placeholder)
 *   beehiiv                       -> Beehiiv (real newsletter draft; fails if unconfigured)
 *   social/video networks         -> the channel's chosen backend:
 *       'webhook' (your own pipeline) | 'mark_posted' | 'auto'
 *       (auto = webhook if configured, else mark-as-posted)
 *
 * The single place the delivery-backend choice lives. We deliberately do NOT
 * bundle social-media aggregators here — outbound posting is handed to your own
 * pipeline via the webhook, or done manually (mark as posted).
 */

import type { EngineConfig } from "@/lib/content-engine/ports";
import { makeBeehiivAdapter } from "./beehiiv";
import { makeWebhookAdapter } from "./webhook";
import { markPostedAdapter } from "./mark-posted";
import type { DeliveryAdapter } from "./types";

/** Channels that route to social/video delivery (not newsletter/manual). */
function isAggregatorPlatform(platform: string): boolean {
  return platform !== "manual" && platform !== "beehiiv" && platform !== "substack";
}

function pick(config: EngineConfig, backend: string): DeliveryAdapter | null {
  if (backend === "webhook") {
    return config.webhook ? makeWebhookAdapter(config.webhook) : null;
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
    const chosen = pick(config, preferred);
    if (chosen) return chosen;
    // requested backend isn't configured — fall through to auto
  }
  return pick(config, "webhook") ?? markPostedAdapter;
}

/** Backends that are configured right now (for status display). */
export function configuredBackends(config: EngineConfig): string[] {
  const out: string[] = [];
  if (config.webhook) out.push("webhook");
  if (config.beehiiv) out.push("beehiiv");
  return out;
}
