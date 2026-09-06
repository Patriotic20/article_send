import { useTranslation } from "react-i18next";

import { partners } from "@/site/content/conference";

/**
 * Лента логотипов организаторов. Без автопрокрутки: шесть логотипов
 * помещаются в строку, а движение ради движения только мешает читать.
 */
export function PartnerStrip() {
  const { t } = useTranslation("site");

  return (
    <section className="border-y bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("home_partners_title")}
        </h2>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((partner) => (
            <li key={partner.id} className="flex items-center">
              <img
                src={partner.logo}
                alt={t(partner.nameKey)}
                title={t(partner.nameKey)}
                loading="lazy"
                className="h-12 w-auto max-w-[150px] object-contain opacity-80 transition-opacity hover:opacity-100"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
