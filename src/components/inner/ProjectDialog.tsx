import { useLanguage, LanguageSwitcher } from "@/components/inner/Language";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL, clean, errorMessage } from "@/lib/inner-room";

export type ProjectRow = { id: string; title: string; genre: string | null; synopsis: string | null; status: string };

export const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:bg-card";

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  project?: ProjectRow;
  onSaved?: (id: string) => void;
}) {
  const { t, direction } = useLanguage();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [status, setStatus] = useState("idea");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(project?.title ?? "");
      setGenre(project?.genre ?? "");
      setSynopsis(project?.synopsis ?? "");
      setStatus(project?.status ?? "idea");
      setError(null);
    }
  }, [open, project]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) return setError("عنوان المشروع مطلوب.");
    setBusy(true);
    setError(null);
    const payload = { title: title.trim(), genre: clean(genre), synopsis: clean(synopsis), status };
    const res = project
      ? await supabase.from("writing_projects").update(payload).eq("id", project.id).select("id").single()
      : await supabase.from("writing_projects").insert(payload).select("id").single();
    setBusy(false);
    if (res.error) return setError(errorMessage(res.error));
    await qc.invalidateQueries({ queryKey: ["projects"] });
    await qc.invalidateQueries({ queryKey: ["project", res.data.id] });
    toast.success(project ? t("تم حفظ التعديلات") : t("تم إنشاء المشروع"));
    onOpenChange(false);
    onSaved?.(res.data.id);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent dir={direction} className="text-start">
        <LanguageSwitcher />
        <DialogHeader className="text-start sm:text-start">
          <DialogTitle className="font-display text-2xl">{project ? t("تعديل المشروع") : t("مشروع كتابة جديد")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-title">{t("العنوان *")}</Label>
            <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-genre">{t("النوع الأدبي")}</Label>
              <Input id="p-genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder={t("رواية نفسية، فانتازيا…")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-status">{t("الحالة")}</Label>
              <select id="p-status" className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{t(PROJECT_STATUS_LABEL[s] ?? "")}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-syn">{t("الملخّص")}</Label>
            <Textarea id="p-syn" rows={4} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{t(error)}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t("حفظ")} </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => onOpenChange(false)}>{t("إلغاء")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
