import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, DoorOpen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/inner/ConfirmDelete";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { EXPLORATION_STATUS_LABEL, ROLE_LABEL, errorMessage, formatDate } from "@/lib/inner-room";
import { characterQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/characters/$characterId")({
  head: () => ({
    meta: [
      { title: "الشخصية — THE INNER ROOM" },
      { name: "description", content: "ملف الشخصية ورحلة استكشافاتها." },
      { property: "og:title", content: "الشخصية — THE INNER ROOM" },
      { property: "og:description", content: "ملف الشخصية ورحلة استكشافاتها." },
    ],
  }),
  component: CharacterPage,
});

const PROFILE: [string, string][] = [
  ["public_persona", "الوجه العام"],
  ["desire", "الرغبة"],
  ["fear", "الخوف"],
  ["secret", "السر"],
  ["inner_conflict", "الصراع الداخلي"],
  ["core_belief", "المعتقد الجوهري"],
  ["red_line", "الخط الأحمر"],
  ["backstory", "الخلفية"],
];

function CharacterPage() {
  const { characterId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const q = useQuery(characterQuery(characterId));
  const ex = useQuery({
    queryKey: ["explorations", characterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("character_explorations")
        .select("id, scenario_title_snapshot, decision_text, motivation_text, status, created_at")
        .eq("character_id", characterId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data)
    return <Empty title="الشخصية غير متاحة">غير موجودة أو لا تخصّك. <Link to="/rooms" className="text-amber underline">العودة</Link></Empty>;
  const c = q.data as typeof q.data & Record<string, string | null>;
  const project = c.writing_projects as unknown as { id: string; title: string } | null;

  async function remove() {
    const { error } = await supabase.from("characters").delete().eq("id", characterId);
    if (error) {
      toast.error(errorMessage(error));
      return false;
    }
    await qc.invalidateQueries({ queryKey: ["characters", c.project_id] });
    await qc.invalidateQueries({ queryKey: ["projects"] });
    toast.success("تم حذف الشخصية");
    navigate({ to: "/projects/$projectId", params: { projectId: c.project_id } });
    return true;
  }

  return (
    <div>
      <Link to="/projects/$projectId" params={{ projectId: c.project_id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> {project?.title ?? "المشروع"}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-amber">{ROLE_LABEL[c.role] ?? c.role}</p>
          <h1 className="text-5xl">{c.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/characters/$characterId/edit" params={{ characterId }}><Pencil className="h-4 w-4" /> تعديل</Link></Button>
          <ConfirmDelete
            title="حذف الشخصية؟"
            description="ستُحذف الشخصية نهائياً. إذا كانت لها استكشافات قد يرفض النظام الحذف حتى تُحذف أولاً."
            onConfirm={remove}
            trigger={<Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /> حذف</Button>}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-primary/50 bg-primary/10 p-6 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl">ادخل الغرفة الداخلية</h2>
          <p className="mt-1 text-sm text-muted-foreground">اختر معضلة وضع {c.name} أمامها. أنت من يكتب ما تقرّره.</p>
        </div>
        <Button asChild size="lg" className="mt-4 sm:mt-0"><Link to="/scenarios" search={{ characterId }}><DoorOpen className="h-5 w-5" /> اختر معضلة</Link></Button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <section>
          <h2 className="text-3xl">الملف</h2>
          <dl className="mt-4 space-y-4">
            {PROFILE.map(([k, label]) => (
              <div key={k} className="border-b pb-3">
                <dt className="text-xs text-amber">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm">{c[k] || <span className="text-muted-foreground">لم يُكتشف بعد</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="text-3xl">رحلة الشخصية</h2>
          <div className="mt-4">
            {ex.isPending ? (
              <Loading />
            ) : ex.isError ? (
              <ErrorState error={ex.error} onRetry={() => ex.refetch()} />
            ) : ex.data.length === 0 ? (
              <Empty title="لم تبدأ الرحلة بعد">
                اضغط «اختر معضلة»، اختر موقفاً من المكتبة، ثم دوّن قرار {c.name} ودافعها وثمنه.
              </Empty>
            ) : (
              <ol className="space-y-4 border-r pr-5">
                {ex.data.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -right-[27px] top-2 h-3 w-3 rounded-full bg-primary" />
                    <Link to="/explorations/$explorationId" params={{ explorationId: e.id }} className="block rounded-xl border bg-card/60 p-4 hover:border-primary">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl">{e.scenario_title_snapshot}</h3>
                        <Badge variant={e.status === "completed" ? "default" : "outline"}>{EXPLORATION_STATUS_LABEL[e.status] ?? e.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(e.created_at)}</p>
                      {e.decision_text && <p className="mt-3 line-clamp-2 text-sm"><span className="text-amber">القرار: </span>{e.decision_text}</p>}
                      {e.motivation_text && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground"><span className="text-amber">الدافع: </span>{e.motivation_text}</p>}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
