import { handler } from "@/lib/api";
import { runIntake } from "@/lib/agents/scribe/intake";

export const dynamic = "force-dynamic";

/** Scan the watched Drive folder + content-flagged check-ins, enqueue jobs. */
export function POST() {
  return handler(() => runIntake());
}
