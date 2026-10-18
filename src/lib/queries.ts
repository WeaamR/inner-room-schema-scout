import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const characterQuery = (id: string) =>
  queryOptions({
    queryKey: ["character", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*, writing_projects(id, title)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const scenariosQuery = queryOptions({
  queryKey: ["scenarios"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("scenario_library")
      .select("id, title, category, premise, dilemma_question, tension_level")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw error;
    return data;
  },
});
