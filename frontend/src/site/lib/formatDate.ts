/**
 * Форматирование дат конференции.
 *
 * Intl для узбекской локали отдаёт «2026 M09 10» — названий месяцев в
 * uz-Latn у браузеров нет. Поэтому названия храним сами, тем более что
 * порядок слов в трёх языках всё равно разный.
 */
const MONTHS: Record<string, string[]> = {
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust",
       "sentabr", "oktabr", "noyabr", "dekabr"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа",
       "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August",
       "September", "October", "November", "December"],
};

function parts(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month: month - 1, day };
}

function baseLang(lang: string): keyof typeof MONTHS {
  const code = lang?.split("-")[0];
  return code === "ru" || code === "en" ? code : "uz";
}

/** Одна дата: «10-sentabr 2026», «10 сентября 2026», «10 September 2026». */
export function formatDate(iso: string, lang: string, withYear = true): string {
  const code = baseLang(lang);
  const { year, month, day } = parts(iso);
  const name = MONTHS[code][month];
  const head = code === "uz" ? `${day}-${name}` : `${day} ${name}`;
  return withYear ? `${head} ${year}` : head;
}

/** Диапазон в одном месяце: «25–26 sentabr 2026». */
export function formatDateRange(fromIso: string, toIso: string, lang: string): string {
  const code = baseLang(lang);
  const from = parts(fromIso);
  const to = parts(toIso);
  if (from.month !== to.month || from.year !== to.year) {
    return `${formatDate(fromIso, lang)} — ${formatDate(toIso, lang)}`;
  }
  const name = MONTHS[code][from.month];
  const days = `${from.day}–${to.day}`;
  const head = code === "uz" ? `${days}-${name}` : `${days} ${name}`;
  return `${head} ${from.year}`;
}
