import { handler } from "@/lib/api";
import { integrationStatuses } from "@/lib/integrations/status";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(async () => ({ integrations: integrationStatuses() }));
}
