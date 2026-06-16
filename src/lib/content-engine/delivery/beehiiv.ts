import "server-only";
import { publishToBeehiiv } from "@/lib/distribution/beehiiv";
import type { DeliveryAdapter } from "./types";

/** Newsletter delivery via Beehiiv (real draft-create). Throws if unconfigured. */
export const beehiivAdapter: DeliveryAdapter = {
  key: "beehiiv",
  async deliver({ content }) {
    const { externalRef } = await publishToBeehiiv(content);
    return { externalRef };
  },
};
