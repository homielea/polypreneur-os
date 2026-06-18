import { handler } from "@/lib/api";
import { runDuePublications } from "@/lib/distribution/publish";

export const dynamic = "force-dynamic";

/** Process scheduled publications whose time has arrived (on-demand cadence). */
export function POST() {
  return handler(() => runDuePublications());
}
