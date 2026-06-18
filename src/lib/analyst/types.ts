/** Client-safe Analyst payload types (no server-only imports). */

import type { Venture } from "@/lib/types";

export type Trend = "rising" | "falling" | "flat";

export interface VentureSignal {
  ventureId: string;
  name: string;
  status: Venture["status"];
  daysSinceActivity: number | null;
  recent: number;
  prior: number;
  trend: Trend;
  cold: boolean;
}

export interface MetricSignal {
  name: string;
  source: string;
  latest: number;
  previous: number | null;
  delta: number | null;
  date: string;
}

export interface AnalystPayload {
  generatedAt: string;
  ventures: VentureSignal[];
  cold: VentureSignal[];
  metrics: MetricSignal[];
}
