import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { TopBar } from "./TopBar";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Общая оболочка сайта: полоса, шапка, контент, подвал. */
export function SiteLayout() {
  const { pathname } = useLocation();

  // Переход между страницами возвращает к началу — иначе роутер сохраняет
  // положение прокрутки и новая страница открывается с середины.
  // Тело блочное намеренно: краткая стрелка вернула бы результат scrollTo,
  // а React принял бы его за функцию очистки.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
