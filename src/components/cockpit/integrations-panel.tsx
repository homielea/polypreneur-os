"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJSON, sendJSON } from "@/lib/client";
import type { IntegrationStatus } from "@/lib/integrations/types";

interface SyncResult {
  collected: number;
  imported: number;
  skippedExisting: number;
  unmatched: number;
}

export function IntegrationsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["integrations"],
    queryFn: () =>
      getJSON<{ integrations: IntegrationStatus[] }>("/api/integrations"),
  });

  const sync = useMutation({
    mutationFn: () => sendJSON<SyncResult>("/api/integrations/sync", "POST"),
    onSuccess: (r) => {
      toast.success(
        `Synced — ${r.imported} imported, ${r.skippedExisting} existing, ${r.unmatched} unmatched`,
      );
      qc.invalidateQueries({ queryKey: ["home"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["ventures"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const items = data?.integrations ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Read integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          v1 reads from existing tools and maps their signals onto venture
          activity (which feeds neglect and the home ranking). Live integrations
          activate when their credentials are present; signals are matched to a
          venture by name.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {items.map((i) => (
            <div
              key={i.key}
              className="flex items-start justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{i.label}</span>
                  <Badge variant={i.mode === "live" ? "default" : "outline"}>
                    {i.mode}
                  </Badge>
                  {i.mode === "live" && (
                    <Badge variant={i.configured ? "secondary" : "outline"}>
                      {i.configured ? "configured" : "needs creds"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{i.note}</p>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => sync.mutate()} disabled={sync.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync now
        </Button>
      </CardContent>
    </Card>
  );
}
