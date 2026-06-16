/**
 * Delivery seam (Phase 0 of extracting the content engine).
 *
 * A `DeliveryAdapter` is the swappable backend that actually puts an approved
 * piece on a channel. The publication lifecycle (schedule, retry, outbox) stays
 * in distribution; HOW a send happens lives behind this interface, so the real
 * delivery backend can be Blotato now and self-hosted Postiz (or anything) later
 * without touching the orchestration.
 *
 * This is the seam where the content engine becomes extractable: a future
 * standalone package depends on this interface, not on Polypreneur internals.
 */

import type { ChannelConnection } from "@/lib/types";

export interface DeliveryInput {
  content: string;
  /** The target account/channel. Null for ad-hoc manual sends. */
  connection: ChannelConnection | null;
  platform: string;
}

export interface DeliveryResult {
  /** External id from the backend (e.g. Blotato post id), or null. */
  externalRef: string | null;
}

export interface DeliveryAdapter {
  key: string;
  deliver(input: DeliveryInput): Promise<DeliveryResult>;
}
