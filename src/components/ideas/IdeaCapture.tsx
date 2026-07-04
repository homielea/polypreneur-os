import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { usePromoteIdea, useVaultIdea } from "@/hooks/useIdeas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CategoryInput } from "@/components/shared/CategoryInput";
import { LeverageSelect } from "@/components/shared/LeverageSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Step = "triage" | "promote";

/**
 * Quick idea capture with the forced 80/20 triage step. There is no plain
 * "save" — every idea must pass through "is this top-20% right now?".
 * Vaulting is the friction-free default; acting requires one more beat.
 */
export function IdeaCapture() {
  const [content, setContent] = useState("");
  const [step, setStep] = useState<Step | null>(null);
  const [category, setCategory] = useState("");
  const [leverage, setLeverage] = useState("4");
  const vaultIdea = useVaultIdea();
  const promoteIdea = usePromoteIdea();

  const startTriage = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim()) setStep("triage");
  };

  const close = () => {
    setStep(null);
    setCategory("");
    setLeverage("4");
  };

  const handleVault = () => {
    vaultIdea.mutate(content.trim(), {
      onSuccess: () => {
        toast.success("Vaulted. It'll resurface for another look.");
        setContent("");
        close();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handlePromote = () => {
    promoteIdea.mutate(
      { content: content.trim(), category: category.trim(), leverage: Number(leverage) },
      {
        onSuccess: () => {
          toast.success("On the Today list — it came through triage.");
          setContent("");
          close();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      <form onSubmit={startTriage} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Capture an idea — triage comes next"
          rows={1}
          className="min-h-10 flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button type="submit" disabled={!content.trim()}>
          Capture
        </Button>
      </form>

      <Dialog open={step !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          {step === "triage" && (
            <>
              <DialogHeader>
                <DialogTitle>The 80/20 question</DialogTitle>
                <DialogDescription className="pt-1">
                  “{content.trim()}” — is this in the top 20% of leverage{" "}
                  <em>right now</em>?
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 grid gap-2">
                <Button onClick={() => setStep("promote")}>Yes — act on it</Button>
                <Button variant="secondary" onClick={handleVault} disabled={vaultIdea.isPending}>
                  Not now — to the vault
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  The vault isn't a graveyard — it resurfaces ideas for re-evaluation.
                </p>
              </div>
            </>
          )}
          {step === "promote" && (
            <>
              <DialogHeader>
                <DialogTitle>Make it an action</DialogTitle>
                <DialogDescription className="pt-1">“{content.trim()}”</DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex gap-2">
                <CategoryInput value={category} onChange={setCategory} className="flex-1" />
                <LeverageSelect value={leverage} onValueChange={setLeverage} className="w-44" />
              </div>
              <Button onClick={handlePromote} disabled={promoteIdea.isPending} className="mt-2">
                {promoteIdea.isPending ? "Creating…" : "Add to Today"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
