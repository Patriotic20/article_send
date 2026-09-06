import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { loadSiteTexts } from "@/i18n";
import { RouteFallback } from "@/components/RouteFallback";

/**
 * Ждёт загрузки словаря сайта для текущего языка.
 *
 * Без ожидания первый кадр показал бы вместо текстов сами ключи
 * (menu_home, paragraph_1) — заметно хуже, чем короткий индикатор.
 */
export function SiteTextsGate({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const language = i18n.language ?? "uz";
  const [ready, setReady] = useState(() =>
    i18n.hasResourceBundle(language.split("-")[0], "site")
  );

  useEffect(() => {
    let active = true;
    setReady(i18n.hasResourceBundle(language.split("-")[0], "site"));
    loadSiteTexts(language).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [i18n, language]);

  if (!ready) return <RouteFallback fullscreen />;
  return <>{children}</>;
}
