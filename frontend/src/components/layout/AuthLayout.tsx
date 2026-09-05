import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSelect } from "./LanguageSelect";
import logoUrl from "@/assets/logo.png";

/**
 * Общая оболочка страниц входа и регистрации: слева тёмно-синяя панель с
 * логотипом и янтарным акцентом (отсылка к hero на idz.nsumt.uz), справа форма.
 * На узких экранах панель схлопывается в компактную шапку.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col justify-center gap-6 bg-primary px-6 py-8 text-primary-foreground lg:w-[42%] lg:px-14 lg:py-12">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={t("appName")}
            className="h-12 w-12 shrink-0 rounded-full bg-white object-contain p-0.5 lg:h-16 lg:w-16"
          />
          <span className="font-display text-xl font-semibold tracking-wide lg:text-2xl">
            {t("appName")}
          </span>
        </div>

        <div className="hidden lg:block">
          {/* Янтарная полоса — тот же маркер, что у заголовков секций сайта. */}
          <div className="mb-5 h-0.5 w-16 bg-brand" />
          <p className="max-w-md font-display text-2xl font-semibold leading-snug">
            {t("auth.tagline")}
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-muted/40 p-4 lg:p-8">
        <div className="flex justify-end">
          <LanguageSelect />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
