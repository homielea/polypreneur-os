"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getJSON, sendJSON } from "@/lib/client";
import type { Idea, VentureStatus } from "@/lib/types";

export default function VaultPage() {
  const qc = useQueryClient();
  const ideas = useQuery({
    queryKey: ["ideas"],
    queryFn: () => getJSON<Idea[]>("/api/ideas"),
  });

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["ideas"] });
    qc.invalidateQueries({ queryKey: ["ventures"] });
    qc.invalidateQueries({ queryKey: ["home"] });
  };

  const capture = useMutation({
    mutationFn: () => sendJSON("/api/ideas", "POST", { title, note }),
    onSuccess: () => {
      toast.success("Idea parked in the vault");
      setTitle("");
      setNote("");
      refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const promote = useMutation({
    mutationFn: (v: { id: string; status: VentureStatus }) =>
      sendJSON(`/api/ideas/${v.id}/promote`, "POST", { status: v.status }),
    onSuccess: () => {
      toast.success("Promoted to a venture");
      refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const del = useMutation({
    mutationFn: (id: string) => sendJSON(`/api/ideas/${id}`, "DELETE"),
    onSuccess: refresh,
  });

  const vault = (ideas.data ?? []).filter((i) => i.status === "vault");
  const promoted = (ideas.data ?? []).filter((i) => i.status === "promoted");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Idea Vault</h1>
        <p className="text-muted-foreground">
          A trusted parking lot so the brain can let go. Promoting an idea
          creates a venture — and is subject to the 80/20 focus cap.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capture an idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Idea title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="A note so future-you remembers why"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            onClick={() => capture.mutate()}
            disabled={!title.trim() || capture.isPending}
          >
            Park it
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          In the vault ({vault.length})
        </h3>
        {vault.length === 0 && (
          <p className="text-sm text-muted-foreground">The vault is empty.</p>
        )}
        {vault.map((idea) => (
          <Card key={idea.id}>
            <CardContent className="space-y-2 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{idea.title}</p>
                  {idea.note && (
                    <p className="text-sm text-muted-foreground">{idea.note}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    captured{" "}
                    {formatDistanceToNow(parseISO(idea.captured_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive"
                  onClick={() => del.mutate(idea.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => promote.mutate({ id: idea.id, status: "experiment" })}
                  disabled={promote.isPending}
                >
                  <ArrowUpRight className="mr-1 h-3 w-3" /> Promote to experiment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => promote.mutate({ id: idea.id, status: "primary" })}
                  disabled={promote.isPending}
                >
                  <ArrowUpRight className="mr-1 h-3 w-3" /> Promote to primary
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {promoted.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Promoted ({promoted.length})
          </h3>
          {promoted.map((idea) => (
            <Card key={idea.id} className="opacity-70">
              <CardContent className="flex items-center justify-between py-3">
                <p className="font-medium">{idea.title}</p>
                <Badge variant="secondary">promoted</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
