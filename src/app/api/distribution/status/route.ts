import { handler } from "@/lib/api";
import { hasWebhook, hasBeehiiv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Which delivery backends are live right now. */
export function GET() {
  return handler(async () => ({
    webhook: hasWebhook,
    beehiiv: hasBeehiiv,
  }));
}
