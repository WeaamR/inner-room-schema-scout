import { useLanguage } from "@/components/inner/Language";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CharacterForm } from "@/components/inner/CharacterForm";
import { Empty, ErrorState, Loading } from "@/components/inner/States";
import { errorMessage } from "@/lib/inner-room";
import { characterQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/characters/$characterId_/edit")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "تعديل الشخصية — THE INNER ROOM" },
      { name: "description", content: "عدّل ملف شخصيتك." },
      { property: "og:title", content: "تعديل الشخصية — THE INNER ROOM" },
      { property: "og:description", content: "عدّل ملف شخصيتك." },
    ],
  }),
  component: EditCharacter,
});

function EditCharacter() {
  const { t } = useLanguage();
  const { characterId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const q = useQuery(characterQuery(characterId));
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return <Empty title={t("الشخصية غير متاحة")}>{t("غير موجودة أو لا تخصّك.")}</Empty>;
  const c = q.data;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-4xl">{t("تعديل:")} {c.name}</h1>
      <CharacterForm
        initial={c}
        onCancel={() => navigate({ to: "/characters/$characterId", params: { characterId } })}
        onSubmit={async (v) => {
          const { error } = await supabase.from("characters").update(v).eq("id", characterId).select("id").single();
          if (error) return errorMessage(error);
          await qc.invalidateQueries({ queryKey: ["character", characterId] });
          await qc.invalidateQueries({ queryKey: ["characters", c.project_id] });
          toast.success(t("تم حفظ التعديلات"));
          navigate({ to: "/characters/$characterId", params: { characterId } });
          return null;
        }}
      />
    </div>
  );
}
