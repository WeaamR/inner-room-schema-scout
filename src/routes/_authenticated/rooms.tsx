import { useLanguage, LanguageSwitcher } from "@/components/inner/Language";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectDialog } from "@/components/inner/ProjectDialog";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { PROJECT_STATUS_LABEL } from "@/lib/inner-room";

export const Route = createFileRoute("/_authenticated/rooms")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s["new"] === true || s["new"] === "true" ? { new: true } : {}),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "غرف الكتابة — THE INNER ROOM" },
      { name: "description", content: "مشاريعك الكتابية وشخصياتها." },
      { property: "og:title", content: "غرف الكتابة — THE INNER ROOM" },
      { property: "og:description", content: "مشاريعك الكتابية وشخصياتها." },
    ],
  }),
  component: Rooms,
});

function Rooms() {
  const { t, language, direction, date, number } = useLanguage();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const q = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("writing_projects")
        .select("id, title, genre, synopsis, status, updated_at, characters(count)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const createOpen = !!search.new || editOpen;
  const setCreateOpen = (o: boolean) => {
    setEditOpen(o);
    if (!o && search.new) navigate({ to: "/rooms", search: {}, replace: true });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{t("غرف الكتابة")}</h1>
          <p className="mt-1 text-muted-foreground">{t("كل مشروع غرفة، وكل شخصية باب.")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> {t("مشروع جديد")}</Button>
      </div>
      <div className="mt-8">
        {q.isPending ? (
          <Loading />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : q.data.length === 0 ? (
          <Empty title={t("لا توجد غرف بعد")}>
            {t("أنشئ مشروعك الأول، ثم أضف إليه شخصياتك وابدأ استكشافها.")}
            <div className="mt-4"><Button onClick={() => setCreateOpen(true)}>{t("أنشئ مشروعاً")}</Button></div>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.map((p) => {
              const count = (p.characters as unknown as { count: number }[])?.[0]?.count ?? 0;
              return (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group rounded-xl border bg-card/60 p-6 transition hover:border-primary hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-2xl group-hover:text-amber">{p.title}</h2>
                    <Badge variant="outline">{t(PROJECT_STATUS_LABEL[p.status] ?? p.status ?? "")}</Badge>
                  </div>
                  {p.genre && <p className="mt-1 text-sm text-amber/80">{p.genre}</p>}
                  {p.synopsis && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.synopsis}</p>}
                  <p className="mt-5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> {number(count)} {count === 1 ? t("شخصية") : t("شخصيات")}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <ProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(id) => navigate({ to: "/projects/$projectId", params: { projectId: id } })}
      />
    </div>
  );
}
