export const PROJECT_STATUSES = ["idea", "in_progress", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABEL: Record<string, string> = {
  idea: "فكرة",
  in_progress: "قيد الكتابة",
  completed: "مكتمل",
};

export const CHARACTER_ROLES = ["protagonist", "antagonist", "supporting", "other"] as const;
export const ROLE_LABEL: Record<string, string> = {
  protagonist: "بطل",
  antagonist: "خصم",
  supporting: "شخصية مساندة",
  other: "أخرى",
};

export const EXPLORATION_STATUS_LABEL: Record<string, string> = {
  draft: "مسودة",
  completed: "مكتملة",
};

const hasText = (v: string | null | undefined) => !!v && v.trim().length > 0;

/** An exploration may be completed only when decision and motivation contain real text. */
export function canCompleteExploration(decision?: string | null, motivation?: string | null) {
  return hasText(decision) && hasText(motivation);
}

/** Empty / whitespace-only optional text is stored as null. */
export function clean(v: string | null | undefined): string | null {
  return hasText(v) ? (v as string) : null;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });
}

export function errorMessage(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  const code = (e as { code?: string })?.code;
  if (/fetch|network/i.test(msg)) return "تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مجدداً.";
  if (/jwt|session|not authenticated/i.test(msg)) return "انتهت جلستك. يرجى تسجيل الدخول من جديد.";
  if (code === "42501" || /row-level security|permission/i.test(msg)) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (code === "23514") return "البيانات لا تستوفي الشروط المطلوبة (مثلاً: القرار والدافع مطلوبان للإكمال).";
  if (code === "23503") return "السجل المرتبط غير موجود أو لا يخصّك.";
  if (code === "PGRST116") return "السجل غير موجود أو لا يخصّك.";
  return "حدث خطأ غير متوقع: " + msg;
}
