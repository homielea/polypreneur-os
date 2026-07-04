import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { LedgerEntry } from "@/types/domain";

export const ledgerKey = ["ledger"];

export function useLedgerEntries() {
  return useQuery({
    queryKey: ledgerKey,
    queryFn: async (): Promise<LedgerEntry[]> => {
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as LedgerEntry[];
    },
  });
}

export interface NewLedgerEntry {
  situation: string;
  judgment: string;
  outcome: string;
  tags: string[];
}

export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewLedgerEntry) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("ledger_entries")
        .insert({ user_id: user.id, ...input })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as LedgerEntry;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ledgerKey }),
  });
}

export function useDeleteLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ledger_entries").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ledgerKey }),
  });
}
