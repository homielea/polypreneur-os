import { useId } from "react";
import { Input } from "@/components/ui/input";
import { useKnownCategories } from "@/hooks/useActions";

/** Category text input with autocomplete from the categories already in use. */
export function CategoryInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const listId = useId();
  const { data: categories } = useKnownCategories();
  return (
    <>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Category"
        aria-label="Category"
        list={listId}
        className={className}
      />
      <datalist id={listId}>
        {(categories ?? []).map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}
