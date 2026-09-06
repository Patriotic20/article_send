import { useTranslation } from "react-i18next";
import { ChevronDown, Languages } from "lucide-react";

import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/i18n";

/**
 * Переключатель языка на нативном <select>.
 *
 * Radix Select здесь был бы избыточен: он попадал в стартовый бандл (шапка
 * рендерится всегда) и тянул за собой позиционирование поповера. Нативный
 * элемент вдобавок открывает системный список на телефоне — по нему удобнее
 * попадать пальцем, чем по выпадающему меню.
 *
 * Вариант onDark — для утилитарной полосы сайта на тёмно-синем фоне.
 */
export function LanguageSelect({
  variant = "default",
}: {
  variant?: "default" | "onDark";
}) {
  const { t, i18n } = useTranslation();
  // Базовый код языка (например, "ru" из "ru-RU").
  const current = i18n.language?.split("-")[0] ?? "uz";
  const onDark = variant === "onDark";

  return (
    <div className="relative flex items-center gap-2">
      {!onDark && (
        <Languages className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
      )}
      <select
        aria-label={t("header.language")}
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className={cn(
          "appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          onDark
            ? "h-7 cursor-pointer rounded border border-white/20 bg-transparent py-0 pl-2 pr-6 text-xs text-primary-foreground/80 focus:ring-offset-primary"
            : "h-9 w-[110px] rounded-md border border-input bg-background pl-3 pr-8 text-sm sm:w-[130px]"
        )}
      >
        {LANGUAGES.map((l) => (
          // Список раскрывает браузер, поэтому пункты рисуются системными
          // цветами — на тёмной полосе им нужен явный светлый фон.
          <option key={l.code} value={l.code} className="bg-background text-foreground">
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute",
          onDark
            ? "right-1.5 h-3.5 w-3.5 text-primary-foreground/60"
            : "right-2.5 h-4 w-4 text-muted-foreground"
        )}
      />
    </div>
  );
}
