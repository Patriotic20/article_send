import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Первый экран: название конференции слева, дата и место — правым нижним
 * блоком поверх фотографии. Высота задаётся содержимым, а не 100vh, чтобы
 * следующий блок был виден при первой прокрутке.
 */
export function Hero() {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <img
        src="/media/hero.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      {/* Градиент к левому краю: заголовок читается поверх любой фотографии. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/30"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.6fr_1fr] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {tApp("auth.conferenceShort")}
          </div>
          <h1 className="font-display text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-5xl">
            {t("header_timing")}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-primary-foreground/75 sm:text-lg">
            {t("welcome_text")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="brand" size="lg">
              <Link to="/app/login">
                {tApp("site.submitCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link to="/dates">{t("nav_dates")}</Link>
            </Button>
          </div>
        </div>

        <dl className="flex flex-col gap-4 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                {t("footer_dates_title")}
              </dt>
              <dd className="font-display text-lg font-semibold">
                {t("main_dates")}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                {t("address_title")}
              </dt>
              <dd className="text-sm leading-snug text-primary-foreground/90">
                {t("hero_venue")}
                <br />
                {t("footer_address")}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </section>
  );
}
