import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CharacterForm } from "@/components/inner/CharacterForm";
import { Empty } from "@/components/inner/States";
import { errorMessage } from "@/lib/inner-room";

export const Route = createFileRoute("/_authenticated/characters/new")({
  validateSearch: (s: Record<string, unknown>) => ({ projectId: typeof s.projectId === "string" ? s.projectId : "" }),
  head: () => ({
    meta: [
      { title: "شخصية جديدة — THE INNER ROOM" },
      { name: "description", content: "استوديو الشخصيات: أضف شخصية جديدة." },
      { property: "og:title", content: "شخصية جديدة — THE INNER ROOM" },
      { property: "og:description", content: "استوديو الشخصيات: أضف شخصية جديدة." },
    ],
  }),
  component: NewCharacter,
});

function NewCharacter() {
  const { projectId } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  if (!projectId) return <Empty title="اختر مشروعاً أولاً">أنشئ الشخصية من صفحة المشروع.</Empty>;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl">استوديو الشخصيات</h1>
      <p className="mt-1 mb-8 text-muted-foreground">شخصية جديدة تنتظر أن تُكتشف.</p>
      <CharacterForm
        onCancel={() => navigate({ to: "/projects/$projectId", params: { projectId } })}
        onSubmit={async (v) => {
          const { data, error } = await supabase.from("characters").insert({ ...v, project_id: projectId }).select("id").single();
          if (error) return errorMessage(error);
          await qc.invalidateQueries({ queryKey: ["characters", projectId] });
          await qc.invalidateQueries({ queryKey: ["projects"] });
          toast.success("تم حفظ الشخصية");
          navigate({ to: "/characters/$characterId", params: { characterId: data.id } });
          return null;
        }}
      />
    </div>
  );
}
