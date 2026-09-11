import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarClock } from "lucide-react";

import {
  SUBMISSION_CTA_ENABLED,
  SUBMISSION_DEADLINE,
  conferenceDates,
  daysUntil,
} from "@/site/content/conference";

/**
 * Полоса с ближайшим сроком. Состояние вычисляется из дат конференции,
 * поэтому после 10 сентября надпись меняется сама — на старом сайте её
 * приходилось править руками, из-за чего «приём завершён» висело во время
 * открытого приёма.
 */
export function DeadlineBanner() {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  const left = daysUntil(SUBMISSION_DEADLINE.date);

  if (left >= 0) {
    return (
      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <CalendarClock className="h-5 w-5 shrink-0" />
          <p className="font-medium">
            {t("dates_deadline_soon")}:{" "}
            <span className="font-display text-lg font-semibold tabular-nums">
              {left}
            </span>{" "}
            {t("dates_days_left")}
          </p>
          {SUBMISSION_CTA_ENABLED && (
            <Link
              to="/app/login"
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {tApp("site.submitCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Приём закрыт — показываем следующий предстоящий этап, а если конференция
  // уже прошла, полоса не выводится вовсе.
  const next = conferenceDates.find((d) => daysUntil(d.endDate ?? d.date) >= 0);
  if (!next) return null;

  return (
    <div className="border-b bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-6">
        <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
        <p className="font-medium text-primary">{t("dates_closed")}</p>
        <p className="text-muted-foreground">{t(next.detailKey)}</p>
      </div>
    </div>
  );
}
