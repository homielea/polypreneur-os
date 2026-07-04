import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useDeleteLedgerEntry } from "@/hooks/useLedger";
import type { LedgerEntry } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export function LedgerEntryCard({ entry }: { entry: LedgerEntry }) {
  const remove = useDeleteLedgerEntry();

  return (
    <Card className="group">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <time className="text-xs text-muted-foreground" dateTime={entry.created_at}>
          {format(new Date(entry.created_at), "MMM d, yyyy · HH:mm")}
        </time>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Delete entry"
          disabled={remove.isPending}
          onClick={() => remove.mutate(entry.id)}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Situation" value={entry.situation} />
        <Field label="Judgment" value={entry.judgment} />
        <Field label="Outcome" value={entry.outcome} />
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
