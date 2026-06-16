"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LEVERAGE_COMPONENTS,
  LEVERAGE_COMPONENT_ORDER,
  type LeverageWeights,
} from "@/config/leverage.config";
import { getJSON, sendJSON } from "@/lib/client";
import { cn } from "@/lib/utils";

interface WeightsResponse {
  weights: LeverageWeights;
  defaults: LeverageWeights;
  customized: boolean;
}

export function WeightsEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["weights"],
    queryFn: () => getJSON<WeightsResponse>("/api/settings/weights"),
  });

  const [draft, setDraft] = useState<LeverageWeights | null>(null);
  useEffect(() => {
    if (data && !draft) setDraft({ ...data.weights });
  }, [data, draft]);

  const save = useMutation({
    mutationFn: (weights: LeverageWeights) =>
      sendJSON("/api/settings/weights", "PUT", { weights }),
    onSuccess: () => {
      toast.success("Weights saved");
      qc.invalidateQueries({ queryKey: ["weights"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const reset = useMutation({
    mutationFn: () => sendJSON("/api/settings/weights", "PUT", { reset: true }),
    onSuccess: () => {
      toast.success("Reset to §6.2 defaults");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["weights"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
  });

  if (isLoading || !draft) {
    return <p className="text-muted-foreground">Loading weights…</p>;
  }

  const sum = LEVERAGE_COMPONENT_ORDER.reduce((s, k) => s + (draft[k] || 0), 0);
  const valid = Math.abs(sum - 1) < 0.001;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leverage weights (§6.2)</CardTitle>
        <p className="text-sm text-muted-foreground">
          The home-screen ranking is{" "}
          <code className="rounded bg-muted px-1">
            (Σ weightᵢ · componentᵢ) × 100
          </code>
          . Defaults live in{" "}
          <code className="rounded bg-muted px-1">
            src/config/leverage.config.ts
          </code>
          ; edits here override them. Weights must sum to 1.0.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {LEVERAGE_COMPONENT_ORDER.map((key) => {
          const def = LEVERAGE_COMPONENTS[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor={`w-${key}`} className="font-medium">
                  {def.label}
                </Label>
                <Input
                  id={`w-${key}`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-24"
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: Number(e.target.value) })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">{def.measures}</p>
            </div>
          );
        })}

        <div
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
            valid
              ? "bg-emerald-50 text-emerald-800"
              : "bg-destructive/10 text-destructive",
          )}
        >
          <span>Sum of weights</span>
          <span className="tabular-nums">{sum.toFixed(3)} {valid ? "✓" : "(must be 1.000)"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => save.mutate(draft)}
            disabled={!valid || save.isPending}
          >
            Save weights
          </Button>
          <Button
            variant="outline"
            onClick={() => reset.mutate()}
            disabled={reset.isPending}
          >
            Reset to defaults
          </Button>
          {data?.customized && (
            <span className="text-xs text-muted-foreground">
              Currently using custom weights
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
