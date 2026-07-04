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

/** Completing an action also records an additive score event (points = leverage). */
export function useCompleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: ActionRecord) => {
      const { error } = await supabase
        .from("actions")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", action.id);
      if (error) throw new Error(error.message);
      await scoringEngine.recordEvent({
        source: "completion",
        category: action.category,
        points: action.leverage,
        actionId: action.id,
      });
      return action;
    },
    onSuccess: () => {
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
