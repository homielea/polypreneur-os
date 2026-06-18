"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJSON, sendJSON } from "@/lib/client";
import { cn } from "@/lib/utils";

type Cadence = "on_demand" | "daily";

export function CadenceEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["cadence"],
    queryFn: () => getJSON<{ cadence: Cadence }>("/api/settings/cadence"),
  });

  const save = useMutation({
    mutationFn: (cadence: Cadence) =>
      sendJSON("/api/settings/cadence", "PUT", { cadence }),
    onSuccess: () => {
      toast.success("Scribe cadence updated");
      qc.invalidateQueries({ queryKey: ["cadence"] });
    },
  });

  const current = data?.cadence ?? "on_demand";

  const options: { value: Cadence; label: string; desc: string }[] = [
    {
      value: "on_demand",
      label: "On-demand (v1 default)",
      desc: "The Scribe runs only when you click Run in the inbox.",
    },
    {
      value: "daily",
      label: "Daily batch",
      desc: "Intended for a scheduled scan + draft. Stored now; the scheduler is wired in a later phase (used by the v2 Scout).",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent cadence</CardTitle>
        <p className="text-sm text-muted-foreground">
          The Scribe is on-demand in v1, but the cadence is configurable so a
          daily-batch mode can be switched on without code changes.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => save.mutate(opt.value)}
            disabled={save.isPending}
            className={cn(
              "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
              current === opt.value
                ? "border-primary bg-primary/5"
                : "hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 rounded-full border",
                current === opt.value
                  ? "border-primary bg-primary"
                  : "border-muted-foreground",
              )}
            />
            <span>
              <span className="block text-sm font-medium">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">
                {opt.desc}
              </span>
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
