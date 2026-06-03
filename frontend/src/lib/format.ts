import i18n, { LOCALE_MAP } from "@/i18n";

// Форматирование ISO-даты с бэкенда (строка, +05:00) в читаемый вид.
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const lang = i18n.language?.split("-")[0] ?? "uz";
  return d.toLocaleString(LOCALE_MAP[lang] ?? "uz-Latn", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
