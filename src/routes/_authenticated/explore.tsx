import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ExplorationForm, ScenarioCard } from "@/components/inner/ExplorationForm";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { errorMessage } from "@/lib/inner-room";
import { characterQuery, scenariosQuery } from "@/lib/queries";

type ExplorationInsert = Database["public"]["Tables"]["character_explorations"]["Insert"];

export const Route = createFileRoute("/_authenticated/explore")({
  validateSearch: (s: Record<string, unknown>): { characterId?: string; scenarioId?: string } => ({
    characterId: typeof s["characterId"] === "string" ? s["characterId"] : undefined,
    scenarioId: typeof s["scenarioId"] === "string" ? s["scenarioId"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "الغرفة الداخلية — THE INNER ROOM" },
      { name: "description", content: "ضع شخصيتك أمام المعضلة ودوّن قرارها." },
      { property: "og:title", content: "الغرفة الداخلية — THE INNER ROOM" },
      { property: "og:description", content: "ضع شخصيتك أمام المعضلة ودوّن قرارها." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { characterId, scenarioId } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const inFlight = useRef(false);
  const ch = useQuery({ enabled: !!characterId, queryKey: ["character", characterId ?? ""], queryFn: characterQuery(characterId ?? "").queryFn });
  const sc = useQuery(scenariosQuery);

  if (!characterId || !scenarioId) return <Empty title="اختر شخصية ومعضلة"><Link to="/scenarios" className="text-amber underline">افتح مكتبة المعضلات</Link></Empty>;
  if (ch.isPending || sc.isPending) return <Loading />;
  if (ch.isError) return <ErrorState error={ch.error} onRetry={() => ch.refetch()} />;
  if (sc.isError) return <ErrorState error={sc.error} onRetry={() => sc.refetch()} />;
  const scenario = sc.data.find((s) => s.id === scenarioId);
  if (!ch.data || !scenario) return <Empty title="غير متاح">الشخصية أو المعضلة غير موجودة أو غير منشورة.</Empty>;
  const character = ch.data;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-muted-foreground">
        <span className="text-amber">{character.name}</span> تدخل الغرفة
      </p>
      <div className="mt-4"><ScenarioCard title={scenario.title} premise={scenario.premise} question={scenario.dilemma_question} /></div>
      <div className="mt-8">
        <ExplorationForm
          onCancel={() => navigate({ to: "/characters/$characterId", params: { characterId } })}
          onSave={async (answers, status) => {
            if (inFlight.current) return null;
            inFlight.current = true;
            // Snapshots and owner are filled by database defaults/trigger; not sent from the client.
            const payload = { character_id: characterId, scenario_id: scenarioId, status, ...answers } as unknown as ExplorationInsert;
            const { data, error } = await supabase.from("character_explorations").insert(payload).select("id").single();
            inFlight.current = false;
            if (error) return errorMessage(error);
            await qc.invalidateQueries({ queryKey: ["explorations", characterId] });
            toast.success(status === "completed" ? "اكتمل الاستكشاف" : "تم حفظ المسودة");
            navigate({ to: "/explorations/$explorationId", params: { explorationId: data.id }, replace: true });
            return null;
          }}
        />
      </div>
    </div>
  );
}
