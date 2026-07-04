import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useArchiveIdea, usePromoteIdea, useRestIdea } from "@/hooks/useIdeas";
import type { Idea } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryInput } from "@/components/shared/CategoryInput";
import { LeverageSelect } from "@/components/shared/LeverageSelect";

export function VaultIdeaCard({ idea, due }: { idea: Idea; due: boolean }) {
  const [promoting, setPromoting] = useState(false);
  const [category, setCategory] = useState("");
  const [leverage, setLeverage] = useState("4");
  const promote = usePromoteIdea();
  const rest = useRestIdea();
  const archive = useArchiveIdea();

  const handlePromote = () => {
    promote.mutate(
      {
        content: idea.content,
        category: category.trim(),
        leverage: Number(leverage),
        existingIdeaId: idea.id,
      },
      {
        onSuccess: () => toast.success("On the Today list — it came through triage."),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{idea.content}</p>
        <p className="text-xs text-muted-foreground">
          captured {format(new Date(idea.created_at), "MMM d, yyyy")}
          {!due && idea.next_resurface_at && (
            <> · resurfaces {format(new Date(idea.next_resurface_at), "MMM d")}</>
          )}
        </p>
        {due && !promoting && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setPromoting(true)}>
              Act on it
            </Button>
            <Button size="sm" variant="secondary" disabled={rest.isPending} onClick={() => rest.mutate(idea.id)}>
              Still the vault
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              disabled={archive.isPending}
              onClick={() =>
                archive.mutate(idea.id, { onSuccess: () => toast("Let go.", { description: idea.content }) })
              }
            >
              Let go
            </Button>
          </div>
        )}
        {due && promoting && (
          <div className="flex flex-wrap gap-2">
            <CategoryInput value={category} onChange={setCategory} className="h-9 w-36" />
            <LeverageSelect value={leverage} onValueChange={setLeverage} className="h-9 w-44" />
            <Button size="sm" disabled={promote.isPending} onClick={handlePromote}>
              {promote.isPending ? "Creating…" : "Add to Today"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPromoting(false)}>
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
