import { handler } from "@/lib/api";
import { ingestMetrics } from "@/lib/analyst/metrics";

export const dynamic = "force-dynamic";

/** Pull named metrics from the live sources into the metric time series. */
export function POST() {
  return handler(() => ingestMetrics());
}
