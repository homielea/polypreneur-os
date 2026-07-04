import { useMemo, useState } from "react";
import { useLedgerEntries } from "@/hooks/useLedger";
import { LedgerEntryCard } from "@/components/ledger/LedgerEntryCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Ledger() {
  const { data: entries, isLoading, error } = useLedgerEntries();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => [...new Set((entries ?? []).flatMap((e) => e.tags))].sort(),
    [entries],
  );

  const visible = useMemo(
    () => (entries ?? []).filter((e) => !activeTag || e.tags.includes(activeTag)),
    [entries, activeTag],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Great Inversion Ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where judgment created value execution couldn't. Capture from anywhere with ⌘J.
        </p>
      </header>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              aria-pressed={activeTag === tag}
            >
              <Badge
                variant={activeTag === tag ? "default" : "outline"}
                className={cn("font-normal", activeTag !== tag && "text-muted-foreground")}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">Couldn't load the ledger: {error.message}</p>
      )}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && !error && visible.length === 0 && (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          {activeTag
            ? "No entries with this tag yet."
            : "Empty so far. Next time your judgment changes an outcome, log it — that's the evidence the thesis is built on."}
        </div>
      )}

      <div className="space-y-3">
        {visible.map((entry) => (
          <LedgerEntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
