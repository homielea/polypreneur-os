import { useMemo } from "react";
import { useLedgerEntries } from "@/hooks/useLedger";
import { reflectionMaterial } from "@/lib/pipe";

/**
 * Fresh-material counts per tag for the Reflection Pipe provider. Derived
 * from the ledger query's cache — quick-capture already invalidates it, so
 * logging a judgment refreshes the ranking input too.
 */
export function useReflectionMaterial(): Record<string, number> | undefined {
  const { data: entries } = useLedgerEntries();
  return useMemo(
    () => (entries ? reflectionMaterial(entries, new Date()) : undefined),
    [entries],
  );
}
