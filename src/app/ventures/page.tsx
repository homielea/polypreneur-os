"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Activity as ActivityIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getJSON, sendJSON } from "@/lib/client";
import type { Activity, Venture, VentureStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VenturesResponse {
  ventures: Venture[];
  focus: {
    primary: { used: number; cap: number };
    experiment: { used: number; cap: number };
  };
}

const STATUS_ORDER: VentureStatus[] = [
  "primary",
  "experiment",
  "vault",
  "dormant",
];
const STATUS_LABEL: Record<VentureStatus, string> = {
  primary: "Primary",
  experiment: "Experiment",
  vault: "Vault",
  dormant: "Dormant",
};

function CapMeter({
  label,
  used,
  cap,
}: {
  label: string;
  used: number;
  cap: number;
}) {
  const full = used >= cap;
  return (
    <div className="flex items-center gap-3 rounded-md border px-4 py-3">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {full ? "Cap reached — the system says no by design" : "Slot available"}
        </div>
      </div>
      <div
        className={cn(
          "rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
          full ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-700",
        )}
      >
        {used}/{cap}
      </div>
    </div>
  );
}

export default function VenturesPage() {
  const qc = useQueryClient();
  const ventures = useQuery({
    queryKey: ["ventures"],
    queryFn: () => getJSON<VenturesResponse>("/api/ventures"),
  });
  const activities = useQuery({
    queryKey: ["activities"],
    queryFn: () => getJSON<Activity[]>("/api/activities"),
  });

  const [name, setName] = useState("");
  const [status, setStatus] = useState<VentureStatus>("experiment");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ventures"] });
    qc.invalidateQueries({ queryKey: ["home"] });
  };

  const create = useMutation({
    mutationFn: () => sendJSON("/api/ventures", "POST", { name, status }),
    onSuccess: () => {
      toast.success("Venture created");
      setName("");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const changeStatus = useMutation({
    mutationFn: (v: { id: string; status: VentureStatus }) =>
      sendJSON(`/api/ventures/${v.id}`, "PATCH", { status: v.status }),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error((e as Error).message),
  });

  const del = useMutation({
    mutationFn: (id: string) => sendJSON(`/api/ventures/${id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Venture deleted");
      invalidate();
    },
  });

  const logActivity = useMutation({
    mutationFn: (id: string) =>
      sendJSON("/api/activities", "POST", { venture_id: id, type: "manual" }),
    onSuccess: () => {
      toast.success("Activity logged");
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
  });

  if (ventures.isLoading || !ventures.data) {
    return <p className="text-muted-foreground">Loading ventures…</p>;
  }

  const lastActivityByVenture = new Map<string, string>();
  for (const a of activities.data ?? []) {
    const cur = lastActivityByVenture.get(a.venture_id);
    if (!cur || a.date > cur) lastActivityByVenture.set(a.venture_id, a.date);
  }

  const byStatus = (s: VentureStatus) =>
    ventures.data!.ventures.filter((v) => v.status === s);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Ventures — 80/20 Enforcer</h1>
        <p className="text-muted-foreground">
          Focus is enforced, not enabled. Activating a venture beyond the cap
          means demoting another or parking the idea in the vault.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <CapMeter
          label="Primary ventures"
          used={ventures.data.focus.primary.used}
          cap={ventures.data.focus.primary.cap}
        />
        <CapMeter
          label="Experiments"
          used={ventures.data.focus.experiment.used}
          cap={ventures.data.focus.experiment.cap}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a venture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Input
              placeholder="Venture name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as VentureStatus)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => create.mutate()}
            disabled={!name.trim() || create.isPending}
          >
            Add
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {STATUS_ORDER.map((s) => (
          <section key={s} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {STATUS_LABEL[s]} ({byStatus(s).length})
            </h3>
            {byStatus(s).length === 0 && (
              <p className="text-sm text-muted-foreground">None.</p>
            )}
            {byStatus(s).map((v) => {
              const last = lastActivityByVenture.get(v.id);
              return (
                <Card key={v.id}>
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {last
                            ? `Last activity ${formatDistanceToNow(parseISO(last), { addSuffix: true })}`
                            : "No activity logged"}
                        </p>
                      </div>
                      <Badge variant={s === "primary" ? "default" : "outline"}>
                        {STATUS_LABEL[s]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={v.status}
                        onValueChange={(val) =>
                          changeStatus.mutate({
                            id: v.id,
                            status: val as VentureStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_ORDER.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {STATUS_LABEL[opt]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => logActivity.mutate(v.id)}
                      >
                        <ActivityIcon className="mr-1 h-3 w-3" /> Log activity
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive"
                        onClick={() => del.mutate(v.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
