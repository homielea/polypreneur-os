import { handler } from "@/lib/api";
import { hasBlotato, hasBeehiiv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Which delivery backends are live right now. */
export function GET() {
  return handler(async () => ({
    blotato: hasBlotato,
    beehiiv: hasBeehiiv,
  }));
}
