import { useTranslation } from "react-i18next";

import { SectionTitle } from "@/site/components/SectionTitle";

/**
 * Главная страница сайта. На этапе 2 здесь стоит только заголовок:
 * шапка, подвал и навигация уже настоящие, блоки главной собираются
 * на этапе 3 согласно разделу 06 технического задания.
 */
export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
      <SectionTitle
        eyebrow={t("auth.conferenceShort")}
        title={t("auth.conferenceTitle")}
        description={t("auth.conferenceDates")}
      />

      <div className="mt-10 max-w-2xl rounded-lg border border-dashed bg-secondary/60 p-6">
        <div className="sec-eyebrow mb-2">{t("site.stub.label")}</div>
        <p className="text-sm text-muted-foreground">{t("site.stub.text")}</p>
      </div>
    </div>
  );
}
