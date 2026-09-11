import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateTimeline } from "@/site/components/DateTimeline";
import { PartnerStrip } from "@/site/components/PartnerStrip";
import { PageShell } from "@/site/components/PageShell";
import { SUBMISSION_CTA_ENABLED } from "@/site/content/conference";

/** Важные даты: лента этапов и полные формулировки сроков. */
export function DatesPage() {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  return (
    <>
      <PageShell
        title={t("important_main")}
        parent={{ labelKey: "nav_authors", to: "/dates" }}
        currentLabel={t("nav_dates")}
      >
        <DateTimeline />

        <div className="mt-10 rounded-lg border bg-secondary/40 p-6">
          <h2 className="font-display text-lg font-semibold text-primary">
            {t("nav_requirements")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("step_2_text")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {SUBMISSION_CTA_ENABLED && (
              <Button asChild variant="brand">
                <Link to="/app/login">
                  {tApp("site.submitCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/submission">{t("nav_requirements")}</Link>
            </Button>
          </div>
        </div>
      </PageShell>
      <PartnerStrip />
    </>
  );
}
