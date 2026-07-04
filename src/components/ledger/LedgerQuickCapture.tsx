import { useEffect, useState, type FormEvent } from "react";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";
import { useCreateLedgerEntry } from "@/hooks/useLedger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

/**
 * Global quick-capture for the Great Inversion Ledger. Mounted once in the
 * app layout: floating button + Cmd/Ctrl+J from anywhere. Only `situation`
 * and `judgment` are required — capture friction stays low, outcome can be
 * added when it's known.
 */
export function LedgerQuickCapture() {
  const [open, setOpen] = useState(false);
  const [situation, setSituation] = useState("");
  const [judgment, setJudgment] = useState("");
  const [outcome, setOutcome] = useState("");
  const [tags, setTags] = useState("");
  const createEntry = useCreateLedgerEntry();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || !judgment.trim()) return;
    createEntry.mutate(
      {
        situation: situation.trim(),
        judgment: judgment.trim(),
        outcome: outcome.trim(),
        tags: parseTags(tags),
      },
      {
        onSuccess: () => {
          toast.success("Logged to the ledger");
          setSituation("");
          setJudgment("");
          setOutcome("");
          setTags("");
          setOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-40 shadow-lg"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <ScrollText className="mr-2 h-4 w-4" />
        Log judgment
        <kbd className="ml-2 hidden rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-normal sm:inline">
          ⌘J
        </kbd>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Great Inversion Ledger</SheetTitle>
            <SheetDescription>
              A moment where your judgment created value execution couldn't.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="lqc-situation">Situation</Label>
              <Textarea
                id="lqc-situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="What was happening?"
                rows={3}
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lqc-judgment">Judgment applied</Label>
              <Textarea
                id="lqc-judgment"
                value={judgment}
                onChange={(e) => setJudgment(e.target.value)}
                placeholder="What did you see, decide, or refuse that a machine wouldn't?"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lqc-outcome">
                Outcome <span className="text-muted-foreground">(optional, add later if unknown)</span>
              </Label>
              <Textarea
                id="lqc-outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What happened because of it?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lqc-tags">
                Tags <span className="text-muted-foreground">(comma-separated)</span>
              </Label>
              <Input
                id="lqc-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="coaching, pricing, casa-lea"
              />
            </div>
            <div className="mt-auto pb-2">
              <Button
                type="submit"
                className="w-full"
                disabled={createEntry.isPending || !situation.trim() || !judgment.trim()}
              >
                {createEntry.isPending ? "Saving…" : "Save entry"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
