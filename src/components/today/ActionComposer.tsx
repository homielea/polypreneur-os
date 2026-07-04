import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCreateAction } from "@/hooks/useActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVERAGE_LABELS: Record<string, string> = {
  "1": "1 — routine",
  "2": "2 — useful",
  "3": "3 — solid",
  "4": "4 — high leverage",
  "5": "5 — needle mover",
};

export function ActionComposer({ knownCategories }: { knownCategories: string[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [leverage, setLeverage] = useState("3");
  const createAction = useCreateAction();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createAction.mutate(
      { title: trimmed, category: category.trim() || "general", leverage: Number(leverage) },
      {
        onSuccess: () => setTitle(""),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's worth doing?"
        aria-label="Action title"
        className="flex-1"
      />
      <Input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        aria-label="Category"
        list="known-categories"
        className="sm:w-36"
      />
      <datalist id="known-categories">
        {knownCategories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Select value={leverage} onValueChange={setLeverage}>
        <SelectTrigger className="sm:w-48" aria-label="Leverage">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LEVERAGE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={createAction.isPending || !title.trim()}>
        Add
      </Button>
    </form>
  );
}
