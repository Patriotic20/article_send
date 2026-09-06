import { useTranslation } from "react-i18next";

import { PageShell } from "@/site/components/PageShell";
import { PersonCard } from "@/site/components/PersonCard";
import { PartnerStrip } from "@/site/components/PartnerStrip";
import { secretariat } from "@/site/content/conference";

/**
 * Оргкомитет. Пока подтверждён только состав секретариата — он и показан;
 * полный список членов оргкомитета с фотографиями ожидается от заказчика,
 * поэтому вместо выдуманных карточек стоит честная врезка.
 */
export function CommitteePage() {
  const { t } = useTranslation("site");

  return (
    <>
      <PageShell
        title={t("team_title")}
        lede={t("team_text")}
        parent={{ labelKey: "nav_authors", to: "/dates" }}
        currentLabel={t("nav_committee")}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secretariat.map((person) => (
            <PersonCard
              key={person.id}
              nameKey={person.nameKey}
              positionKey={person.positionKey}
            />
          ))}
        </div>

        <p className="mt-8 max-w-2xl rounded-lg border border-dashed bg-secondary/50 p-5 text-sm text-muted-foreground">
          {t("content_pending")}
        </p>
      </PageShell>
      <PartnerStrip />
    </>
  );
}
