import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { nextResurfaceDate } from "@/lib/vault";
import { useAuth } from "@/contexts/AuthContext";
import { actionsKey } from "@/hooks/useActions";
import type { ActionRecord, Idea } from "@/types/domain";

export const ideasKey = ["ideas"];

export function useVaultIdeas() {
  return useQuery({
    queryKey: ideasKey,
    queryFn: async (): Promise<Idea[]> => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("status", "active")
        .eq("triage", "vault")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Idea[];
    },
  });
}

/** Vault an idea (fresh capture triaged out of the top 20%). */
export function useVaultIdea() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("ideas").insert({
        user_id: user.id,
        content,
        triage: "vault",
        next_resurface_at: nextResurfaceDate(new Date()),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ideasKey }),
  });
}

export interface PromoteInput {
  content: string;
  category: string;
  leverage: number;
  /** Set when promoting an existing vaulted idea rather than a fresh capture. */
  existingIdeaId?: string;
}

/**
 * Top-20% path: record the idea, create the action it becomes (source
 * idea_promotion, which earns the top20-boost in ranking), link the two.
 */
export function usePromoteIdea() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: PromoteInput) => {
      if (!user) throw new Error("Not signed in");
      const { data: action, error: actionError } = await supabase
        .from("actions")
        .insert({
          user_id: user.id,
          title: input.content,
          category: input.category || "general",
          leverage: input.leverage,
          source: "idea_promotion",
        })
        .select()
        .single();
      if (actionError) throw new Error(actionError.message);

      // Two writes, no transaction: if the idea write fails, delete the action
      // we just created so a retry can't leave duplicate boosted actions.
      const ideaWrite = input.existingIdeaId
        ? await supabase
            .from("ideas")
            .update({ status: "promoted", promoted_action_id: action.id })
            .eq("id", input.existingIdeaId)
        : await supabase.from("ideas").insert({
            user_id: user.id,
            content: input.content,
            triage: "now",
            status: "promoted",
            promoted_action_id: action.id,
          });
      if (ideaWrite.error) {
        await supabase.from("actions").delete().eq("id", action.id);
        throw new Error(ideaWrite.error.message);
      }
      return action as ActionRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideasKey });
      queryClient.invalidateQueries({ queryKey: actionsKey });
    },
  });
}

/** "Still the vault" on a resurfaced idea — rest it for another interval. */
export function useRestIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ideas")
        .update({ next_resurface_at: nextResurfaceDate(new Date()) })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ideasKey }),
  });
}

/** "Let go" — archived, not deleted; the record stays honest. */
export function useArchiveIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ideas").update({ status: "archived" }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ideasKey }),
  });
}
