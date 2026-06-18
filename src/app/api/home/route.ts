import { handler } from "@/lib/api";
import { buildHome } from "@/lib/leverage/home";

export const dynamic = "force-dynamic";

export function GET() {
  return handler(() => buildHome());
}
