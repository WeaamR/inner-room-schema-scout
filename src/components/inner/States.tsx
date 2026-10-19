import { useLanguage } from "@/components/inner/Language";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/inner-room";

export function Loading({ label = "جارٍ التحميل…" }: { label?: string }) {
  const { t, language, direction, date, number } = useLanguage();
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground" role="status">
      <Loader2 className="h-5 w-5 animate-spin" /> {t(label)}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t, language, direction, date, number } = useLanguage();
  return (
    <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
      <p className="text-sm">{t(errorMessage(error))}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {t("حاول مجدداً")}
        </Button>
      )}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  const { t, language, direction, date, number } = useLanguage();
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <h3 className="text-2xl text-amber">{t(title)}</h3>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
