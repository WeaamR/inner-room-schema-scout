import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, readLanguage, translate, type Language } from "@/lib/translations";

const LanguageContext = createContext({ language: DEFAULT_LANGUAGE as Language, direction: "rtl" as "rtl" | "ltr", setLanguage: (_: Language) => {}, t: (key: string, values?: Record<string, string | number>) => translate(DEFAULT_LANGUAGE, key, values), number: (value: number) => new Intl.NumberFormat("ar").format(value), date: (iso: string) => new Date(iso).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" }) });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  useEffect(() => {
    try { updateLanguage(readLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))); } catch { /* Browser storage may be disabled. */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  const setLanguage = (value: Language) => {
    updateLanguage(value);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, value); } catch { /* Switching still works without persistence. */ }
  };
  return <LanguageContext.Provider value={{ language, direction: language === "ar" ? "rtl" : "ltr", setLanguage, t: (key, values) => translate(language, key, values), number: value => new Intl.NumberFormat(language).format(value), date: iso => new Date(iso).toLocaleDateString(language, { year: "numeric", month: "long", day: "numeric" }) }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { return useContext(LanguageContext); }
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return <div role="group" aria-label={t("اللغة")} className="flex shrink-0 items-center gap-1" dir="ltr">
    <Button type="button" variant={language === "ar" ? "outline" : "ghost"} size="sm" aria-pressed={language === "ar"} onClick={() => setLanguage("ar")} lang="ar">العربية</Button>
    <Button type="button" variant={language === "en" ? "outline" : "ghost"} size="sm" aria-pressed={language === "en"} onClick={() => setLanguage("en")} lang="en">English</Button>
  </div>;
}
