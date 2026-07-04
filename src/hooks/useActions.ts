import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { scoringEngine } from "@/lib/scoring";
import { useAuth } from "@/contexts/AuthContext";
import type { ActionRecord } from "@/types/domain";

export const actionsKey = ["actions"];
export const scoreTotalsKey = ["score-totals"];

export function useOpenActions() {
  return useQuery({
    queryKey: [...actionsKey, "open"],
    queryFn: async (): Promise<ActionRecord[]> => {
      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data as ActionRecord[];
    },
  });
}

/** Distinct categories in use, for autocomplete. Fetches only the category column. */
export function useKnownCategories() {
  return useQuery({
    queryKey: [...actionsKey, "categories"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from("actions").select("category");
      if (error) throw new Error(error.message);
      return [...new Set((data ?? []).map((r) => r.category))].sort();
    },
  });
}

export interface NewAction {
  title: string;
  category: string;
  leverage: number;
  notes?: string;
  source?: "manual" | "idea_promotion";
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewAction) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("actions")
        .insert({
          user_id: user.id,
          title: input.title,
          category: input.category || "general",
          leverage: input.leverage,
          notes: input.notes ?? "",
          source: input.source ?? "manual",
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ActionRecord;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: actionsKey }),
  });
}

export interface CompleteResult {
  /** false when the action was already completed elsewhere (second tab, double-click). */
  completed: boolean;
  /** false when the action completed but the score event failed to persist. */
  pointsRecorded: boolean;
}

/** Completing an action also records an additive score event (points = leverage). */
export function useCompleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: ActionRecord): Promise<CompleteResult> => {
      // Guard on status so a double-click or second tab can't complete (and
      // score) the same action twice — only the open→done transition matches.
      const { data, error } = await supabase
        .from("actions")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", action.id)
        .eq("status", "open")
        .select("id");
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return { completed: false, pointsRecorded: false };
      try {
        await scoringEngine.recordEvent({
          source: "completion",
          category: action.category,
          points: action.leverage,
          actionId: action.id,
        });
      } catch {
        // The action is done either way; surface the points miss instead of
        // failing the whole mutation and leaving the UI claiming it's open.
        return { completed: true, pointsRecorded: false };
      }
      return { completed: true, pointsRecorded: true };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: actionsKey });
      queryClient.invalidateQueries({ queryKey: scoreTotalsKey });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("actions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: actionsKey }),
  });
}
