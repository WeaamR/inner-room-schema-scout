import { localizedField, categoryLabels, tensionLabels } from "@/lib/translations";
import { useLanguage } from "@/components/inner/Language";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { selectClass } from "@/components/inner/ProjectDialog";
import { scenariosQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/scenarios")({
  validateSearch: (s: Record<string, unknown>): { characterId?: string | undefined; category?: string | undefined } => ({
    characterId: typeof s["characterId"] === "string" ? s["characterId"] : undefined,
    category: typeof s["category"] === "string" ? s["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "مكتبة المعضلات — THE INNER ROOM" },
      { name: "description", content: "اختر معضلة لتضع شخصيتك أمامها." },
      { property: "og:title", content: "مكتبة المعضلات — THE INNER ROOM" },
      { property: "og:description", content: "اختر معضلة لتضع شخصيتك أمامها." },
    ],
  }),
  component: Scenarios,
});

function Scenarios() {
  const { t, language } = useLanguage();
  const { characterId, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/scenarios" });
  const q = useQuery(scenariosQuery);
  const chars = useQuery({
    queryKey: ["all-characters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("characters").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const categories = Array.from(new Set((q.data ?? []).map((s) => s.category)));
  const list = (q.data ?? []).filter((s) => !category || s.category === category);

  return (
    <div>
      <h1 className="text-4xl">{t("مكتبة المعضلات")}</h1>
      <p className="mt-1 text-muted-foreground">{t("مواقف صعبة تنتظر قرار شخصيتك.")}</p>

      <div className="mt-6 max-w-sm space-y-2">
        <label htmlFor="sc-char" className="text-sm">{t("الشخصية التي ستدخل الغرفة")}</label>
        <select
          id="sc-char"
          className={selectClass}
          value={characterId ?? ""}
          onChange={(e) => navigate({ search: (p) => ({ ...p, characterId: e.target.value || undefined }), replace: true })}
        >
          <option value="">{t("— اختر شخصية —")}</option>
          {chars.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {chars.data && chars.data.length === 0 && (
          <p className="text-xs text-muted-foreground">{t("لا توجد شخصيات بعد.")} <Link to="/rooms" className="text-amber underline">{t("أنشئ واحدة")}</Link>.</p>
        )}
      </div>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" variant={!category ? "default" : "outline"} onClick={() => navigate({ search: (p) => ({ ...p, category: undefined }) })}>{t("الكل")}</Button>
          {categories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => navigate({ search: (p) => ({ ...p, category: c }) })}>{t(categoryLabels[c] ?? c)}</Button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {q.isPending ? (
          <Loading />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : list.length === 0 ? (
          <Empty title={t("لا توجد معضلات منشورة")}>{t("لم تُنشر أي معضلة في هذا التصنيف بعد.")}</Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((s) => (
              <article key={s.id} className="flex flex-col rounded-xl border bg-card/60 p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber">{t(categoryLabels[s.category] ?? s.category)}</span>
                  <span className="flex items-center gap-0.5" aria-label={`${t("مستوى التوتر")}: ${t(tensionLabels[s.tension_level] ?? "")}`} title={`${t("مستوى التوتر")}: ${t(tensionLabels[s.tension_level] ?? "")}`}>
                    {Array.from({ length: Math.max(1, s.tension_level) }).map((_, i) => <Flame key={i} className="h-3.5 w-3.5 text-primary" />)}
                  <span className="ms-1">{t(tensionLabels[s.tension_level] ?? "")}</span></span>
                </div>
                <h2 className="mt-2 text-2xl">{localizedField(s, "title", "title_ar", language)}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{localizedField(s, "premise", "premise_ar", language)}</p>
                <p className="mt-4 border-s-2 border-amber ps-3 text-sm">{localizedField(s, "dilemma_question", "dilemma_question_ar", language)}</p>
                <div className="mt-auto pt-5">
                  {characterId ? (
                    <Button asChild size="sm"><Link to="/explore" search={{ characterId, scenarioId: s.id }}>{t("ابدأ الاستكشاف")}</Link></Button>
                  ) : (
                    <Button size="sm" disabled>{t("اختر شخصية أولاً")}</Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
