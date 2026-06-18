import { handler } from "@/lib/api";
import { buildAnalysis } from "@/lib/analyst/analyze";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => buildAnalysis());
}
