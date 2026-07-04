import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCompleteAction, useDeleteAction } from "@/hooks/useActions";
import type { RankedAction } from "@/lib/scoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function ActionRow({ ranked, rank }: { ranked: RankedAction; rank: number }) {
  const { action, reasons } = ranked;
  const complete = useCompleteAction();
  const remove = useDeleteAction();

  const handleComplete = () => {
    complete.mutate(action, {
      onSuccess: (result) => {
        if (!result.completed) return; // already done elsewhere; list will refresh
        if (result.pointsRecorded) {
          toast.success(`Done. +${action.leverage} ${action.category}`, {
            description: action.title,
          });
        } else {
          toast.warning("Completed, but the points didn't record.", {
            description: action.title,
          });
        }
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <li className="group flex items-start gap-3 rounded-lg border bg-card px-4 py-3">
      <span className="mt-0.5 w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        {rank}
      </span>
      <Checkbox
        className="mt-1"
        aria-label={`Complete ${action.title}`}
        checked={false}
        disabled={complete.isPending}
        onCheckedChange={handleComplete}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{action.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{reasons.join(" · ")}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">{action.category}</Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Delete ${action.title}`}
          disabled={remove.isPending}
          onClick={() => remove.mutate(action.id)}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </li>
  );
}
