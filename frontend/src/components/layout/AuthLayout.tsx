import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { LanguageSelect } from "./LanguageSelect";
import logoUrl from "@/assets/logo.png";

/**
 * Общая оболочка страниц входа и регистрации: слева тёмно-синяя панель с
 * гербом университета и названием конференции (отсылка к hero на
 * idz.nsumt.uz), справа форма. На узких экранах панель схлопывается в
 * компактную шапку.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col gap-8 bg-primary px-6 py-8 text-primary-foreground lg:w-[44%] lg:justify-between lg:px-14 lg:py-12">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={t("auth.universityName")}
            className="h-12 w-12 shrink-0 rounded-full bg-white object-contain p-0.5 lg:h-14 lg:w-14"
          />
          <span className="max-w-[16rem] text-sm font-medium leading-snug text-primary-foreground/80">
            {t("auth.universityName")}
          </span>
        </div>

        {/* Название конференции — то же, что в шапке сайта: человек должен
            видеть, что попал туда, откуда пришёл, а не в чужой сервис. */}
        <div className="hidden lg:block">
          {/* Янтарная полоса — тот же маркер, что у заголовков секций сайта. */}
          <div className="mb-5 h-0.5 w-16 bg-brand" />
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand">
            {t("auth.conferenceShort")}
          </p>
          <p className="mt-3 max-w-lg font-display text-2xl font-semibold leading-snug">
            {t("auth.conferenceTitle")}
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">
            {t("auth.conferenceDates")}
          </p>
          <p className="mt-8 max-w-md text-sm text-primary-foreground/70">
            {t("auth.tagline")}
          </p>
        </div>

        {/* Ссылка ведёт за пределы SPA (сайт лежит в корне, приложение — в
            /app/), поэтому обычный <a>, а не роутерный Link. */}
        <a
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToSite")}
        </a>
      </aside>

      <main className="flex flex-1 flex-col bg-muted/40 p-4 lg:p-8">
        <div className="flex justify-end">
          <LanguageSelect />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
