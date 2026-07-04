import { useMemo } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useLedgerEntries } from "@/hooks/useLedger";
import { formatDigest, groupByTag, MATERIAL_READY_THRESHOLD } from "@/lib/pipe";
import { LedgerEntryCard } from "@/components/ledger/LedgerEntryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Pipe() {
  const { data: entries, isLoading, error } = useLedgerEntries();

  const groups = useMemo(() => groupByTag(entries ?? [], new Date()), [entries]);
  const untaggedCount = useMemo(
    () => (entries ?? []).filter((e) => e.tags.length === 0).length,
    [entries],
  );

  const copyDigest = async (tag: string) => {
    const group = groups.find((g) => g.tag === tag);
    if (!group) return;
    try {
      await navigator.clipboard.writeText(formatDigest(tag, group.entries));
      toast.success(`Digest copied — ${group.entries.length} entries on "${tag}"`, {
        description: "Paste it into your newsletter or script draft.",
      });
    } catch {
      toast.error("Couldn't reach the clipboard in this browser.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Content Pipe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your logged judgments, gathered by theme — raw material for newsletters and scripts.
        </p>
      </header>

      {error && <p className="text-sm text-destructive">Couldn't load the pipe: {error.message}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && !error && groups.length === 0 && (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          Nothing in the pipe yet. Tag your ledger entries and they'll gather here by theme.
        </div>
      )}

      {groups.map((group) => (
        <section key={group.tag} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium">{group.tag}</h2>
            <span className="text-sm text-muted-foreground">
              {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
              {group.recentCount > 0 && ` · ${group.recentCount} fresh`}
            </span>
            {group.recentCount >= MATERIAL_READY_THRESHOLD && (
              <Badge variant="secondary" className="font-normal">
                ready to draft
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => copyDigest(group.tag)}
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy digest
            </Button>
          </div>
          <div className="space-y-3">
            {group.entries.map((entry) => (
              <LedgerEntryCard key={`${group.tag}-${entry.id}`} entry={entry} />
            ))}
          </div>
        </section>
      ))}

      {untaggedCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {untaggedCount} untagged {untaggedCount === 1 ? "entry isn't" : "entries aren't"} in the
          pipe — add tags in the Ledger to turn them into material.
        </p>
      )}
    </div>
  );
}
