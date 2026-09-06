import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/logo.png";

/**
 * Заглушка главной страницы сайта (этап 1 редизайна).
 *
 * Задача этапа — доказать, что каркас стоит: сайт занимает корень, кабинет
 * остался на /app/, токены и шрифты доехали. Настоящие блоки главной
 * появляются на этапе 3, поэтому здесь намеренно нет ни героя, ни секций —
 * пустая страница честнее, чем декоративная имитация будущей вёрстки.
 */
export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <img
            src={logoUrl}
            alt={t("auth.universityName")}
            className="h-10 w-10 shrink-0 rounded-full bg-white object-contain p-0.5"
          />
          <span className="font-display text-sm font-medium leading-snug text-primary-foreground/80">
            {t("auth.universityName")}
          </span>
          <Button asChild variant="brand" size="sm" className="ml-auto">
            <Link to="/app/login">
              {t("site.submitCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
        <div className="sec-title max-w-3xl">
          <div className="sec-eyebrow mb-2">{t("auth.conferenceShort")}</div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
            {t("auth.conferenceTitle")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("auth.conferenceDates")}
          </p>
        </div>

        <div className="mt-12 max-w-2xl rounded-lg border border-dashed bg-secondary/60 p-6">
          <div className="sec-eyebrow mb-2">{t("site.stub.label")}</div>
          <p className="text-sm text-muted-foreground">{t("site.stub.text")}</p>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          {t("auth.universityName")}
        </div>
      </footer>
    </div>
  );
}
