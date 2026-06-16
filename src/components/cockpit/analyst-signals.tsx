"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getJSON } from "@/lib/client";
import type { AnalystPayload } from "@/lib/analyst/types";

/**
 * Compact Analyst nudge on the home screen: which active ventures are going
 * cold. Only renders when there's something to flag — no clutter otherwise.
 */
export function AnalystSignals() {
  const { data } = useQuery({
    queryKey: ["analyst"],
    queryFn: () => getJSON<AnalystPayload>("/api/analyst"),
  });

  if (!data || data.cold.length === 0) return null;

  return (
    <Card className="border-sky-200 bg-sky-50/40">
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Snowflake className="h-4 w-4 shrink-0 text-sky-500" />
          <span>
            <span className="font-medium">
              {data.cold.length} venture{data.cold.length > 1 ? "s" : ""} going cold:
            </span>{" "}
            {data.cold.map((c) => c.name).join(", ")}
          </span>
        </div>
        <Link
          href="/analyst"
          className="shrink-0 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
        >
          Analyst →
        </Link>
      </CardContent>
    </Card>
  );
}
