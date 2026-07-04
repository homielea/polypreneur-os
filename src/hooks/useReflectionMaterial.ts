import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import { ledgerKey } from "@/hooks/useLedger";
import { MATERIAL_WINDOW_DAYS, reflectionMaterial, type MaterialEntry } from "@/lib/pipe";

/**
 * Fresh-material counts per tag for the Reflection Pipe provider. Fetches
 * only tags + created_at inside the material window — the Today page doesn't
 * need the full ledger text. Keyed under ledgerKey so quick-capture's
 * invalidation refreshes this too.
 */
export function useReflectionMaterial(): Record<string, number> | undefined {
  const { data: entries } = useQuery({
    queryKey: [...ledgerKey, "material"],
    queryFn: async (): Promise<MaterialEntry[]> => {
      const since = subDays(new Date(), MATERIAL_WINDOW_DAYS);
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("tags, created_at")
        .gte("created_at", since.toISOString());
      if (error) throw new Error(error.message);
      return data as MaterialEntry[];
    },
  });
  return useMemo(
    () => (entries ? reflectionMaterial(entries, new Date()) : undefined),
    [entries],
  );
}
