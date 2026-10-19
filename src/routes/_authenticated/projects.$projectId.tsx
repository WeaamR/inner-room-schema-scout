import { useLanguage, LanguageSwitcher } from "@/components/inner/Language";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectDialog } from "@/components/inner/ProjectDialog";
import { ConfirmDelete } from "@/components/inner/ConfirmDelete";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { PROJECT_STATUS_LABEL, ROLE_LABEL, errorMessage } from "@/lib/inner-room";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "المشروع — THE INNER ROOM" },
      { name: "description", content: "تفاصيل المشروع وشخصياته." },
      { property: "og:title", content: "المشروع — THE INNER ROOM" },
      { property: "og:description", content: "تفاصيل المشروع وشخصياته." },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { t, language, direction, date, number } = useLanguage();
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);

  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("writing_projects").select("*").eq("id", projectId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const chars = useQuery({
    queryKey: ["characters", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("id, name, role, desire, fear")
        .eq("project_id", projectId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  if (project.isPending) return <Loading />;
  if (project.isError) return <ErrorState error={project.error} onRetry={() => project.refetch()} />;
  if (!project.data)
    return (
      <Empty title={t("المشروع غير متاح")}>{t("هذا المشروع غير موجود أو لا يخصّك.")} <Link to="/rooms" className="text-amber underline">{t("العودة إلى الغرف")}</Link>
      </Empty>
    );
  const p = project.data;

  async function remove() {
    const { error } = await supabase.from("writing_projects").delete().eq("id", projectId);
    if (error) {
      toast.error(t(errorMessage(error)));
      return false;
    }
    await qc.invalidateQueries({ queryKey: ["projects"] });
    toast.success(t("تم حذف المشروع"));
    navigate({ to: "/rooms" });
    return true;
  }

  return (
    <div>
      <Link to="/rooms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="ltr:rotate-180 h-4 w-4" />{t("غرف الكتابة")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl">{p.title}</h1>
            <Badge variant="outline">{t(PROJECT_STATUS_LABEL[p.status] ?? p.status ?? "")}</Badge>
          </div>
          {p.genre && <p className="mt-1 text-amber">{p.genre}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEdit(true)}><Pencil className="h-4 w-4" /> {t("تعديل")}</Button>
          <ConfirmDelete
            title={t("حذف المشروع؟")}
            description={t("سيُحذف المشروع نهائياً. إذا كانت له شخصيات قد يرفض النظام الحذف حتى تُحذف أولاً.")}
            onConfirm={remove}
            trigger={<Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /> {t("حذف")}</Button>}
          />
        </div>
      </div>
      {p.synopsis && <p className="mt-4 max-w-3xl whitespace-pre-wrap text-muted-foreground">{p.synopsis}</p>}

      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-3xl">{t("الشخصيات")}</h2>
        <Button asChild size="sm"><Link to="/characters/new" search={{ projectId }}><Plus className="h-4 w-4" /> {t("شخصية جديدة")}</Link></Button>
      </div>
      <div className="mt-6">
        {chars.isPending ? (
          <Loading />
        ) : chars.isError ? (
          <ErrorState error={chars.error} onRetry={() => chars.refetch()} />
        ) : chars.data.length === 0 ? (
          <Empty title={t("لا شخصيات بعد")}>{t("يكفي اسم لتبدأ. ستكتشف الباقي داخل الغرفة.")}</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chars.data.map((c) => (
              <Link key={c.id} to="/characters/$characterId" params={{ characterId: c.id }} className="rounded-xl border bg-card/60 p-5 transition hover:border-primary">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl">{c.name}</h3>
                  <span className="text-xs text-amber">{t(ROLE_LABEL[c.role] ?? c.role ?? "")}</span>
                </div>
                {c.desire && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground"><span className="text-foreground">{t("تريد:")} </span>{c.desire}</p>}
                {c.fear && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground"><span className="text-foreground">{t("تخاف:")} </span>{c.fear}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
      <ProjectDialog open={edit} onOpenChange={setEdit} project={p} />
    </div>
  );
}
