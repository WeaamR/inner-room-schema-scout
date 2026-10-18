import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canCompleteExploration, clean } from "@/lib/inner-room";

export type ExplorationAnswers = {
  decision_text: string | null;
  motivation_text: string | null;
  potential_cost: string | null;
  author_reflection: string | null;
};

const PROMPTS: { key: keyof ExplorationAnswers; n: string; title: string; q: string }[] = [
  { key: "decision_text", n: "١", title: "القرار", q: "ماذا ستفعل الشخصية؟" },
  { key: "motivation_text", n: "٢", title: "الدافع", q: "لماذا ستتخذ هذا القرار؟" },
  { key: "potential_cost", n: "٣", title: "الثمن المحتمل", q: "ما الذي قد تخسره بسبب هذا القرار؟" },
  { key: "author_reflection", n: "٤", title: "تأملات الكاتب", q: "ماذا يكشف هذا القرار عن الشخصية؟" },
];

export function ExplorationForm({
  initial,
  onSave,
  onCancel,
  cancelLabel = "العودة إلى الشخصية",
}: {
  initial?: Partial<ExplorationAnswers>;
  /** Returns an error message, or null on confirmed success. */
  onSave: (answers: ExplorationAnswers, status: "draft" | "completed") => Promise<string | null>;
  onCancel: () => void;
  cancelLabel?: string;
}) {
  const [v, setV] = useState<Record<keyof ExplorationAnswers, string>>({
    decision_text: initial?.decision_text ?? "",
    motivation_text: initial?.motivation_text ?? "",
    potential_cost: initial?.potential_cost ?? "",
    author_reflection: initial?.author_reflection ?? "",
  });
  const [busy, setBusy] = useState<null | "draft" | "completed">(null);
  const [error, setError] = useState<string | null>(null);

  async function save(status: "draft" | "completed") {
    if (busy) return;
    if (status === "completed" && !canCompleteExploration(v.decision_text, v.motivation_text)) {
      setError("لإكمال الاستكشاف، اكتب القرار والدافع على الأقل. يمكنك حفظه كمسودة الآن.");
      return;
    }
    setBusy(status);
    setError(null);
    const err = await onSave(
      {
        decision_text: clean(v.decision_text),
        motivation_text: clean(v.motivation_text),
        potential_cost: clean(v.potential_cost),
        author_reflection: clean(v.author_reflection),
      },
      status,
    );
    setBusy(null);
    if (err) setError(err);
  }

  return (
    <div className="space-y-6">
      {PROMPTS.map((p) => (
        <div key={p.key} className="rounded-xl border bg-card/60 p-5">
          <label htmlFor={`x-${p.key}`} className="flex items-baseline gap-3">
            <span className="font-display text-3xl text-primary">{p.n}</span>
            <span>
              <span className="block font-display text-2xl text-amber">{p.title}</span>
              <span className="text-sm text-muted-foreground">{p.q}</span>
            </span>
          </label>
          <Textarea
            id={`x-${p.key}`}
            rows={4}
            className="mt-4 text-base leading-relaxed"
            value={v[p.key]}
            onChange={(e) => setV({ ...v, [p.key]: e.target.value })}
          />
        </div>
      ))}
      {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => save("completed")} disabled={!!busy}>
          {busy === "completed" && <Loader2 className="h-4 w-4 animate-spin" />} إكمال الاستكشاف
        </Button>
        <Button variant="outline" onClick={() => save("draft")} disabled={!!busy}>
          {busy === "draft" && <Loader2 className="h-4 w-4 animate-spin" />} حفظ كمسودة
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={!!busy}>{cancelLabel}</Button>
      </div>
    </div>
  );
}

export function ScenarioCard({ title, premise, question }: { title: string; premise: string; question: string }) {
  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6">
      <p className="text-xs text-amber">المعضلة</p>
      <h2 className="mt-1 text-3xl">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{premise}</p>
      <p className="mt-4 border-r-2 border-amber pr-3 text-lg">{question}</p>
    </div>
  );
}
