import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { conferenceDates, daysUntil } from "@/site/content/conference";
import { formatDate, formatDateRange } from "@/site/lib/formatDate";

/**
 * Лента этапов конференции с отметкой текущего. Прошедшие этапы гасятся,
 * ближайший выделяется янтарём — посетителю не нужно сверять даты с
 * календарём, чтобы понять, что происходит сейчас.
 */
export function DateTimeline({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation("site");
  const lang = i18n.language ?? "uz";

  const currentIndex = conferenceDates.findIndex(
    (d) => daysUntil(d.endDate ?? d.date) >= 0
  );

  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {conferenceDates.map((item, i) => {
        const passed = currentIndex === -1 || i < currentIndex;
        const current = i === currentIndex;

        return (
          <li
            key={item.id}
            className={cn(
              "relative flex flex-col gap-1.5 rounded-lg border p-4",
              current && "border-brand bg-brand/5",
              passed && "opacity-60"
            )}
          >
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                current ? "text-brand" : "text-muted-foreground"
              )}
            >
              {passed ? t("dates_done") : current ? t("dates_now") : `0${i + 1}`}
            </span>
            <span className="font-display text-lg font-semibold text-primary">
              {item.endDate
                ? formatDateRange(item.date, item.endDate, lang)
                : formatDate(item.date, lang)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t(item.labelKey)}
            </span>
            {!compact && (
              <span className="mt-1 text-sm leading-snug text-foreground/80">
                {t(item.detailKey)}
              </span>
            )}
            {passed && (
              <Check
                aria-hidden="true"
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
