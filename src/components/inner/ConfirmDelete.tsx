import { useLanguage, LanguageSwitcher } from "@/components/inner/Language";
import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ConfirmDelete({
  trigger,
  title,
  description,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  onConfirm: () => Promise<boolean>;
}) {
  const { t, direction } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent dir={direction} className="text-start">
        <LanguageSwitcher />
        <AlertDialogHeader className="text-start sm:text-start">
          <AlertDialogTitle>{t(title)}</AlertDialogTitle>
          <AlertDialogDescription>{t(description)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const ok = await onConfirm();
              setBusy(false);
              if (ok) setOpen(false);
            }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{t("حذف نهائي")}
          </Button>
          <AlertDialogCancel disabled={busy}>{t("إلغاء")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
