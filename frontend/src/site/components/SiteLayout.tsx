import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SiteTextsGate } from "./SiteTextsGate";
import { TopBar } from "./TopBar";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Общая оболочка сайта: полоса, шапка, контент, подвал. */
export function SiteLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation("site");

  // Переход между страницами возвращает к началу — иначе роутер сохраняет
  // положение прокрутки и новая страница открывается с середины.
  // Тело блочное намеренно: краткая стрелка вернула бы результат scrollTo,
  // а React принял бы его за функцию очистки.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SiteTextsGate>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Первая цель для Tab: у сайта шесть разделов меню, и без этой ссылки
            клавиатурному посетителю пришлось бы проходить их на каждой
            странице, чтобы добраться до текста. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:font-medium focus:text-brand-foreground"
        >
          {t("skip_to_content")}
        </a>
        <TopBar />
        <SiteHeader />
        <main id="content" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </SiteTextsGate>
  );
}
