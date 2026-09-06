import { useTranslation } from "react-i18next";
import { ChevronDown, Languages } from "lucide-react";

import { LANGUAGES } from "@/i18n";

/**
 * Переключатель языка на нативном <select>.
 *
 * Radix Select здесь был бы избыточен: он попадал в стартовый бандл (шапка
 * рендерится всегда) и тянул за собой позиционирование поповера. Нативный
 * элемент вдобавок открывает системный список на телефоне — по нему удобнее
 * попадать пальцем, чем по выпадающему меню.
 */
export function LanguageSelect() {
  const { t, i18n } = useTranslation();
  // Базовый код языка (например, "ru" из "ru-RU").
  const current = i18n.language?.split("-")[0] ?? "uz";

  return (
    <div className="relative flex items-center gap-2">
      <Languages className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
      <select
        aria-label={t("header.language")}
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="h-9 w-[110px] appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-[130px]"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-muted-foreground" />
    </div>
  );
}
