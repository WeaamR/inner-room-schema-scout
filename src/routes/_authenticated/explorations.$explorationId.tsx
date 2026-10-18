import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/inner/ConfirmDelete";
import { ExplorationForm, ScenarioCard } from "@/components/inner/ExplorationForm";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { EXPLORATION_STATUS_LABEL, errorMessage, formatDate } from "@/lib/inner-room";

export const Route = createFileRoute("/_authenticated/explorations/$explorationId")({
  head: () => ({
    meta: [
      { title: "الاستكشاف — THE INNER ROOM" },
      { name: "description", content: "تفاصيل استكشاف الشخصية." },
      { property: "og:title", content: "الاستكشاف — THE INNER ROOM" },
      { property: "og:description", content: "تفاصيل استكشاف الشخصية." },
    ],
  }),
  component: ExplorationPage,
});

const ANSWERS: [string, string][] = [
  ["decision_text", "القرار"],
  ["motivation_text", "الدافع"],
  ["potential_cost", "الثمن المحتمل"],
  ["author_reflection", "تأملات الكاتب"],
];

function ExplorationPage() {
  const { explorationId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const q = useQuery({
    queryKey: ["exploration", explorationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("character_explorations")
        .select("*, characters(name)")
        .eq("id", explorationId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return <Empty title="الاستكشاف غير متاح">غير موجود أو لا يخصّك.</Empty>;
  const e = q.data as typeof q.data & Record<string, string | null>;
  const charName = (e.characters as unknown as { name: string } | null)?.name ?? "الشخصية";

  async function remove() {
    const { error } = await supabase.from("character_explorations").delete().eq("id", explorationId);
    if (error) {
      toast.error(errorMessage(error));
      return false;
    }
    await qc.invalidateQueries({ queryKey: ["explorations", e.character_id] });
    toast.success("تم حذف الاستكشاف");
    navigate({ to: "/characters/$characterId", params: { characterId: e.character_id } });
    return true;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/characters/$characterId" params={{ characterId: e.character_id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> {charName}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant={e.status === "completed" ? "default" : "outline"}>{EXPLORATION_STATUS_LABEL[e.status] ?? e.status}</Badge>
          <span>أُنشئ {formatDate(e.created_at)}</span>
          {e.updated_at !== e.created_at && <span>· عُدّل {formatDate(e.updated_at)}</span>}
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> تعديل</Button>
            <ConfirmDelete
              title="حذف الاستكشاف؟"
              description="سيُحذف هذا الاستكشاف نهائياً من رحلة الشخصية."
              onConfirm={remove}
              trigger={<Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /> حذف</Button>}
            />
          </div>
        )}
      </div>
      <div className="mt-6">
        <ScenarioCard title={e.scenario_title_snapshot} premise={e.scenario_premise_snapshot} question={e.dilemma_question_snapshot} />
      </div>
      <div className="mt-8">
        {editing ? (
          <ExplorationForm
            initial={e}
            cancelLabel="إلغاء التعديل"
            onCancel={() => setEditing(false)}
            onSave={async (answers, status) => {
              const { error } = await supabase
                .from("character_explorations")
                .update({ ...answers, status })
                .eq("id", explorationId)
                .select("id")
                .single();
              if (error) return errorMessage(error);
              await qc.invalidateQueries({ queryKey: ["exploration", explorationId] });
              await qc.invalidateQueries({ queryKey: ["explorations", e.character_id] });
              toast.success(status === "completed" ? "اكتمل الاستكشاف" : "تم حفظ المسودة");
              setEditing(false);
              return null;
            }}
          />
        ) : (
          <dl className="space-y-6">
            {ANSWERS.map(([k, label]) => (
              <div key={k} className="rounded-xl border bg-card/60 p-5">
                <dt className="font-display text-xl text-amber">{label}</dt>
                <dd className="mt-2 whitespace-pre-wrap leading-relaxed">{e[k] || <span className="text-muted-foreground">لم يُكتب بعد</span>}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
