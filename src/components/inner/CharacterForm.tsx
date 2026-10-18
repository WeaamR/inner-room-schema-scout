import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CHARACTER_ROLES, ROLE_LABEL, clean } from "@/lib/inner-room";
import { selectClass } from "./ProjectDialog";

export type CharacterValues = {
  name: string;
  role: string;
  public_persona: string | null;
  desire: string | null;
  fear: string | null;
  secret: string | null;
  inner_conflict: string | null;
  core_belief: string | null;
  red_line: string | null;
  backstory: string | null;
};

const FIELDS: { key: keyof CharacterValues; label: string; hint: string }[] = [
  { key: "public_persona", label: "الوجه العام", hint: "كيف يراها الآخرون؟" },
  { key: "desire", label: "الرغبة", hint: "ماذا تريد الشخصية؟" },
  { key: "fear", label: "الخوف", hint: "مما تخاف؟" },
  { key: "secret", label: "السر", hint: "ما الذي تخفيه؟" },
  { key: "inner_conflict", label: "الصراع الداخلي", hint: "ما الذي يتنازعها من الداخل؟" },
  { key: "core_belief", label: "المعتقد الجوهري", hint: "ما الفكرة التي توجّهها؟" },
  { key: "red_line", label: "الخط الأحمر", hint: "ما الحدّ الذي لا تريد تجاوزه؟" },
  { key: "backstory", label: "الخلفية", hint: "اختياري: ماضيها وما شكّلها." },
];

export function CharacterForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<CharacterValues>;
  onSubmit: (v: CharacterValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = { name: initial?.name ?? "", role: initial?.role ?? "other" };
    FIELDS.forEach((f) => (o[f.key] = (initial?.[f.key] as string) ?? ""));
    return o;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!(v['name'] ?? '').trim()) return setError("اسم الشخصية مطلوب.");
    setBusy(true);
    setError(null);
    const payload = { name: (v['name'] ?? '').trim(), role: v['role'] } as CharacterValues;
    FIELDS.forEach((f) => ((payload as Record<string, string | null>)[f.key] = clean(v[f.key])));
    const err = await onSubmit(payload);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="c-name">الاسم *</Label>
          <Input id="c-name" value={(v['name'] ?? '')} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-role">الدور</Label>
          <select id="c-role" className={selectClass} value={v['role']} onChange={(e) => setV({ ...v, role: e.target.value })}>
            {CHARACTER_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">الاسم وحده يكفي للحفظ. أكمل الباقي متى اكتشفته.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={`c-${f.key}`}>{f.label}</Label>
            <Textarea id={`c-${f.key}`} rows={3} placeholder={f.hint} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} حفظ الشخصية</Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>إلغاء</Button>
      </div>
    </form>
  );
}
