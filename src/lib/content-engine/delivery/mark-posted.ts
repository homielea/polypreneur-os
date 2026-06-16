import "server-only";
import type { DeliveryAdapter } from "./types";

/**
 * "Mark as posted" — for `manual` and placeholder channels (no real backend
 * wired yet). The operator is asserting they posted it; we record it shipped
 * with no external ref. Honest: we never claim an API call we didn't make.
 */
export const markPostedAdapter: DeliveryAdapter = {
  key: "mark_posted",
  async deliver() {
    return { externalRef: null };
  },
};
