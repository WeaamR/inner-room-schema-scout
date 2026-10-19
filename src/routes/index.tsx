import { useLanguage, LanguageSwitcher } from "@/components/inner/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/inner-room-hero.jpg";
import { Wordmark } from "@/components/inner/Brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "THE INNER ROOM — Enter the mind. Discover the character." },
      { name: "description", content: "مساحة كتابة إبداعية تكتشف فيها شخصياتك عبر القرارات الصعبة والمعضلات والأسرار." },
      { property: "og:title", content: "THE INNER ROOM" },
      { property: "og:description", content: "ادخل عقل شخصيتك واكتشفها من خلال قراراتها." },
    ],
  }),
  component: Landing,
});

const steps = [
  { n: "١", t: "القرار", q: "ماذا ستفعل الشخصية؟", a: "ستخفي الحقيقة… لليلة واحدة فقط." },
  { n: "٢", t: "الدافع", q: "لماذا ستتخذ هذا القرار؟", a: "لأن صديقها هو آخر ما تبقّى لها من الماضي." },
  { n: "٣", t: "الثمن المحتمل", q: "ما الذي قد تخسره؟", a: "ثقتها بنفسها، وربما صوتها الأخلاقي." },
  { n: "٤", t: "تأملات الكاتب", q: "ماذا يكشف هذا عنها؟", a: "أن خوفها من الوحدة أقوى من مبادئها." },
];

function Landing() {
  const { t, direction } = useLanguage();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <Wordmark />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm"><Link to="/auth" search={{ mode: "signin" }}>{t("تسجيل الدخول")}</Link></Button>
          <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>{t("إنشاء حساب")}</Link></Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-2xl border">
          <img src={hero} alt={t("غرفة كاتب خافتة الإضاءة ليلاً")} width={1600} height={1008} className="h-[520px] w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
            <p dir={direction} className="font-brand text-sm tracking-[0.3em] text-amber">{t("ادخل العقل. اكتشف الشخصية.")}</p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-6xl">{t("ادخل عقل شخصيتك، واكتشفها من خلال قراراتها.")}</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              {t("ضع شخصياتك أمام معضلات صعبة، ودوّن ما تختاره ولماذا وما ستخسره. أنت من يقرّر — والغرفة تحفظ كل رحلة لتعود إليها.")}
            </p>
            <Button asChild size="lg" className="mt-8"><Link to="/auth" search={{ mode: "signup" }}>{t("ادخل الغرفة الأولى")}</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl">{t("كيف تجري الاستكشافات")}</h2>
        <div className="mt-4 rounded-xl border bg-card/60 p-6">
          <p className="text-xs text-amber">{t("مثال على معضلة")}</p>
          <p className="mt-2 text-lg">{t("تكتشف الشخصية أن صديقاً تثق به قد ارتكب أمراً مؤذياً. كشف الحقيقة قد يدمّر علاقتهما.")}</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={t(s.n)} className="rounded-xl border bg-card/40 p-5">
              <span className="text-3xl text-primary">{t(s.n)}</span>
              <h3 className="mt-2 text-xl text-amber">{t(s.t)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(s.q)}</p>
              <p className="mt-4 border-s-2 border-primary ps-3 text-sm italic">{t(s.a)}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <span dir="ltr" className="font-brand tracking-widest">THE INNER ROOM</span> — {t("مساحة للكاتب، لا تشخّص ولا تحلّل نيابةً عنك.")}
      </footer>
    </div>
  );
}
