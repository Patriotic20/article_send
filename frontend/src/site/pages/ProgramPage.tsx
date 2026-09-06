import { useTranslation } from "react-i18next";

import { PageShell } from "@/site/components/PageShell";
import { DateTimeline } from "@/site/components/DateTimeline";
import { PartnerStrip } from "@/site/components/PartnerStrip";
import { conferenceDates } from "@/site/content/conference";

/**
 * Программа конференции. По расписанию организаторов итоговая программа
 * публикуется 18 сентября, поэтому до этой даты страница показывает срок
 * публикации и ленту этапов, а не пустой раздел.
 */
export function ProgramPage() {
  const { t } = useTranslation("site");
  const programDate = conferenceDates.find((d) => d.id === "program");

  return (
    <>
      <PageShell
        title={t("nav_program")}
        lede={programDate ? t(programDate.detailKey) : undefined}
        parent={{ labelKey: "nav_authors", to: "/dates" }}
      >
        <p className="mb-10 max-w-2xl rounded-lg border border-dashed bg-secondary/50 p-5 text-sm text-muted-foreground">
          {t("content_pending")}
        </p>
        <DateTimeline compact />
      </PageShell>
      <PartnerStrip />
    </>
  );
}
