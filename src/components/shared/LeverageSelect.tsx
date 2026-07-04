import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Single source of truth for the 1–5 leverage scale's wording. */
export const LEVERAGE_LABELS: Record<string, string> = {
  "1": "1 — routine",
  "2": "2 — useful",
  "3": "3 — solid",
  "4": "4 — high leverage",
  "5": "5 — needle mover",
};

export function LeverageSelect({
  value,
  onValueChange,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-48", className)} aria-label="Leverage">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LEVERAGE_LABELS).map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
