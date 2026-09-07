import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, FileUp, UserPlus, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/site/components/SectionTitle";
import { Hero } from "@/site/components/Hero";
import { DeadlineBanner } from "@/site/components/DeadlineBanner";
import { PartnerStrip } from "@/site/components/PartnerStrip";
import { DateTimeline } from "@/site/components/DateTimeline";
import { PersonCard } from "@/site/components/PersonCard";
import { sections, secretariat } from "@/site/content/conference";

// Порядок блоков — это порядок вопросов посетителя: что это, когда,
// о чём, кто, как подать. См. раздел 06 технического задания.
const steps = [
  { icon: UserPlus, titleKey: "step_1_title", textKey: "step_1_text" },
  { icon: FileUp, titleKey: "step_2_title", textKey: "step_2_text" },
  { icon: BellRing, titleKey: "step_3_title", textKey: "step_3_text" },
];

const facts = [
  { value: "100+", labelKey: "fact_participants" },
  { value: "6", labelKey: "fact_sections" },
  { value: "6", labelKey: "fact_partners" },
];

const regionTiles = [
  { to: "/region/zarafshon", labelKey: "nav_zarafshon", image: "/media/regions/zarafshon.webp" },
  { to: "/region/samarqand", labelKey: "nav_samarqand", image: "/media/regions/samarqand.webp" },
  { to: "/region/buxoro", labelKey: "nav_buxoro", image: "/media/regions/buxoro.webp" },
  { to: "/region/navoiy", labelKey: "nav_navoiy", image: "/media/regions/navoiy.webp" },
];

export function HomePage() {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  return (
    <>
      <Hero />
      <DeadlineBanner />
      <PartnerStrip />

      {/* О конференции */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <SectionTitle
              eyebrow={t("home_about_title")}
              title={t("welcome_title")}
            />
            <div className="mt-6 flex max-w-2xl flex-col gap-4 leading-relaxed text-foreground/90">
              <p>{t("paragraph_1")}</p>
              <p>{t("cta_text")}</p>
            </div>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/about">
                {t("btn_more")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-1">
            {facts.map((fact) => (
              <div key={fact.labelKey} className="bg-background p-5">
                <dt className="font-display text-3xl font-semibold text-primary tabular-nums">
                  {fact.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {t(fact.labelKey)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Научные направления */}
      <section className="border-y bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle
            eyebrow={t("topics_title_topic")}
            title={t("home_sections_title")}
            action={
              <Button asChild variant="outline">
                <Link to="/sections/mining">{t("home_all_sections")}</Link>
              </Button>
            }
          />
          <ul className="mt-8 flex flex-wrap gap-3">
            {sections.map((section) => (
              <li key={section.id}>
                <span className="inline-flex rounded-full border border-primary/25 bg-background px-4 py-2 text-sm font-medium text-primary">
                  {t(section.titleKey)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Важные даты */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow={tApp("auth.conferenceShort")}
          title={t("home_dates_title")}
          action={
            <Button asChild variant="outline">
              <Link to="/dates">{t("home_all_dates")}</Link>
            </Button>
          }
        />
        <div className="mt-8">
          <DateTimeline compact />
        </div>
      </section>

      {/* Как подать тезис */}
      <section className="border-y bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="sec-title max-w-3xl before:bg-brand">
            <div className="sec-eyebrow mb-1.5">{t("nav_authors")}</div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              {t("home_submit_title")}
            </h2>
          </div>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.titleKey} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display font-semibold text-brand-foreground">
                    {i + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-brand" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-primary-foreground/75">
                  {t(step.textKey)}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
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
              <Link to="/submission">{t("nav_requirements")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Секретариат */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow={t("team_text")}
          title={t("home_team_title")}
          action={
            <Button asChild variant="outline">
              <Link to="/committee">{t("home_all_team")}</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {secretariat.map((person) => (
            <PersonCard
              key={person.id}
              nameKey={person.nameKey}
              positionKey={person.positionKey}
              photo={person.photo}
            />
          ))}
        </div>
      </section>

      {/* О регионе */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle
            eyebrow={t("nav_region")}
            title={t("home_region_title")}
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {regionTiles.map((tile) => (
              <li key={tile.to}>
                <Link
                  to={tile.to}
                  className="group relative block overflow-hidden rounded-lg border"
                >
                  <img
                    src={tile.image}
                    alt=""
                    loading="lazy"
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-primary/85 to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-4 font-display text-lg font-semibold text-white">
                    {t(tile.labelKey)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
