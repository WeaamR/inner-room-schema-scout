import { useLanguage, LanguageSwitcher } from "@/components/inner/Language";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, Menu, Plus, BookOpen, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/inner/Brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { email: data.user.email ?? "" };
  },
  component: AppShell,
});

function AppShell() {
  const { t } = useLanguage();
  const { email } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const links = (
    <>
      <Link to="/rooms" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground [&.active]:text-amber">
        <BookOpen className="h-4 w-4" />{t("غرف الكتابة")}
      </Link>
      <Link to="/rooms" search={{ new: true }} onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <Plus className="h-4 w-4" />{t("مشروع جديد")}
      </Link>
    </>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex min-h-14 flex-wrap py-2 max-w-6xl items-center justify-between gap-4 px-4">
          <Wordmark className="text-sm sm:text-base" />
          <LanguageSwitcher />
           <nav className="hidden items-center gap-6 lg:flex">{links}</nav>
          <div className="hidden items-center gap-3 lg:flex">
            <span className="max-w-[180px] truncate text-xs text-muted-foreground" dir="ltr">{email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> {t("خروج")}</Button>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("القائمة")} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <div className="flex flex-col gap-4 border-t px-4 py-4 lg:hidden">
            {links}
            <span className="truncate text-xs text-muted-foreground" dir="ltr">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> {t("تسجيل الخروج")}</Button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}
