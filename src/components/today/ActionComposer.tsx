import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCreateAction } from "@/hooks/useActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryInput } from "@/components/shared/CategoryInput";
import { LeverageSelect } from "@/components/shared/LeverageSelect";

export function ActionComposer() {
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
      <CategoryInput value={category} onChange={setCategory} className="sm:w-36" />
      <LeverageSelect value={leverage} onValueChange={setLeverage} className="sm:w-48" />
      <Button type="submit" disabled={createAction.isPending || !title.trim()}>
        Add
      </Button>
    </form>
  );
}
