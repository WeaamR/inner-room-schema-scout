import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/inner/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "signin" | "signup" } => ({ mode: s["mode"] === "signup" ? "signup" : "signin" }),
  head: () => ({
    meta: [
      { title: "الدخول — THE INNER ROOM" },
      { name: "description", content: "سجّل الدخول أو أنشئ حساباً لتدخل غرف شخصياتك." },
      { property: "og:title", content: "الدخول — THE INNER ROOM" },
      { property: "og:description", content: "سجّل الدخول أو أنشئ حساباً لتدخل غرف شخصياتك." },
    ],
  }),
  component: AuthPage,
});

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (/not confirmed/i.test(msg)) return "لم يتم تأكيد بريدك بعد. افتح رسالة التأكيد أولاً.";
  if (/already registered/i.test(msg)) return "هذا البريد مسجّل مسبقاً. جرّب تسجيل الدخول.";
  if (/password/i.test(msg)) return "كلمة المرور ضعيفة: استخدم ٦ أحرف على الأقل.";
  if (/fetch|network/i.test(msg)) return "تعذّر الاتصال بالخادم.";
  return msg;
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/rooms", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/rooms" },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/rooms", replace: true });
        else setConfirmSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/rooms", replace: true });
      }
    } catch (err) {
      setError(translate((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Wordmark className="mb-10" />
      <div className="w-full max-w-sm rounded-2xl border bg-card/80 p-8 shadow-2xl">
        {confirmSent ? (
          <div className="text-center">
            <h1 className="text-3xl text-amber">تحقّق من بريدك</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              أرسلنا رابط تأكيد إلى <span dir="ltr">{email}</span>. افتحه لتفعيل حسابك ثم سجّل الدخول.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => { setConfirmSent(false); navigate({ search: { mode: "signin" } }); }}>
              العودة لتسجيل الدخول
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl">{mode === "signup" ? "أنشئ حسابك" : "مرحباً بعودتك"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? "ابدأ رحلتك إلى داخل شخصياتك." : "الغرف بانتظارك."}
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" dir="ltr" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? "إنشاء الحساب" : "تسجيل الدخول"}
              </Button>
            </form>
            <button
              type="button"
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-amber"
              onClick={() => { setError(null); navigate({ search: { mode: mode === "signup" ? "signin" : "signup" } }); }}
            >
              {mode === "signup" ? "لديك حساب؟ سجّل الدخول" : "ليس لديك حساب؟ أنشئ واحداً"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
