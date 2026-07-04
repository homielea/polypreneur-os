import { useMemo } from "react";
import { useOpenActions } from "@/hooks/useActions";
import { useVaultIdeas } from "@/hooks/useIdeas";
import { partitionVault } from "@/lib/vault";
import { IdeaCapture } from "@/components/ideas/IdeaCapture";
import { VaultIdeaCard } from "@/components/ideas/VaultIdeaCard";

export default function Ideas() {
  const { data: ideas, isLoading, error } = useVaultIdeas();
  const { data: actions } = useOpenActions();

  const { due, resting } = useMemo(
    () => partitionVault(ideas ?? [], new Date()),
    [ideas],
  );

  const knownCategories = useMemo(
    () => [...new Set((actions ?? []).map((a) => a.category))].sort(),
    [actions],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything gets captured. Only the top 20% gets acted on — the rest waits in the vault.
        </p>
      </header>

      <IdeaCapture knownCategories={knownCategories} />

      {error && <p className="text-sm text-destructive">Couldn't load ideas: {error.message}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {due.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">
            Worth another look?{" "}
            <span className="font-normal text-muted-foreground">
              These rested a while — has their moment come?
            </span>
          </h2>
          {due.map((idea) => (
            <VaultIdeaCard key={idea.id} idea={idea} due />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Vault{resting.length > 0 && ` · ${resting.length}`}
        </h2>
        {!isLoading && !error && resting.length === 0 && due.length === 0 && (
          <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            The vault is empty. Capture ideas as they come — triage keeps today honest.
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {resting.map((idea) => (
            <VaultIdeaCard key={idea.id} idea={idea} due={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
