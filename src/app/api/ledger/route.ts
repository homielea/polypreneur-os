import { handler } from "@/lib/api";
import { buildLedger } from "@/lib/ledger";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => buildLedger());
}
