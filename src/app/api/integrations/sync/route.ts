import { handler } from "@/lib/api";
import { syncIntegrations } from "@/lib/integrations/sync";

export const dynamic = "force-dynamic";

/** Pull from the live read integrations and import matched signals as activity. */
export function POST() {
  return handler(() => syncIntegrations());
}
