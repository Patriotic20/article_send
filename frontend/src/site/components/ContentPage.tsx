import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarClock, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { tableOfContents, type PageContent } from "@/site/content/types";
import { findSiblings, type NavLeaf } from "@/site/navigation";
import {
  SUBMISSION_DEADLINE,
  conferenceDates,
  daysUntil,
} from "@/site/content/conference";
import { formatDate } from "@/site/lib/formatDate";
import { Blocks } from "./Blocks";
import { PageMeta } from "./PageMeta";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";

/**
 * Шаблон текстовой страницы: хлебные крошки, заголовок, обложка, текст
 * в левой колонке и липкая панель справа — оглавление, ближайший срок,
 * кнопка подачи и соседние страницы раздела.
 *
 * Двухколоночная раскладка появилась не ради красоты: в одну колонку
 * правая половина экрана пустовала, а со страницы не было ни одного
 * перехода дальше — человек дочитывал и упирался в конец.
 */
export function ContentPage({ page }: { page: PageContent }) {
  const { t, i18n } = useTranslation("site");
  const { t: tApp } = useTranslation();
  const { pathname } = useLocation();

  const toc = tableOfContents(page.blocks);
  const { group, prev, next, related } = findSiblings(pathname);

  const daysLeft = daysUntil(SUBMISSION_DEADLINE.date);
  const nextDate =
    daysLeft >= 0
      ? SUBMISSION_DEADLINE
      : conferenceDates.find((d) => daysUntil(d.endDate ?? d.date) >= 0);

  const siblingLink = (item: NavLeaf, direction: "prev" | "next") => (
    <Link
      to={item.to}
      className="group flex flex-1 items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-brand/60 hover:bg-secondary/50"
    >
      {direction === "prev" && (
        <ArrowLeft className="h-4 w-4 shrink-0 text-brand" />
      )}
      <span className={direction === "next" ? "ml-auto text-right" : ""}>
        <span className="block text-xs uppercase tracking-wider text-muted-foreground">
          {t(direction === "prev" ? "nav_prev" : "nav_next")}
        </span>
        <span className="mt-0.5 block font-medium text-primary">
          {t(item.labelKey)}
        </span>
      </span>
      {direction === "next" && (
        <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
      )}
    </Link>
  );

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <PageMeta
          title={t(page.shortTitleKey ?? page.titleKey)}
          description={page.ledeKey ? t(page.ledeKey) : undefined}
        />

        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                {t("menu_home")}
              </Link>
            </li>
            {page.parent && (
              <>
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                <li>
                  <Link to={page.parent.to} className="hover:text-foreground">
                    {t(page.parent.labelKey)}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            <li aria-current="page" className="text-foreground">
              {t(page.shortTitleKey ?? page.titleKey)}
            </li>
          </ol>
        </nav>

        <header className="sec-title mb-8 max-w-3xl">
          <div className="sec-eyebrow mb-1.5">{tApp("auth.conferenceShort")}</div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
            {t(page.titleKey)}
          </h1>
          {page.ledeKey && (
            <p className="mt-4 text-lg text-muted-foreground">{t(page.ledeKey)}</p>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
          <div className="min-w-0 max-w-3xl">
            {page.cover && (
              <figure className="mb-10 flex flex-col gap-2">
                <img
                  src={page.cover}
                  alt=""
                  className="h-[200px] w-full rounded-lg border object-cover sm:h-[280px]"
                />
                {page.coverCaptionKey && (
                  <figcaption className="text-sm text-muted-foreground">
                    {t(page.coverCaptionKey)}
                  </figcaption>
                )}
              </figure>
            )}

            <Blocks blocks={page.blocks} />

            {(prev || next) && (
              <div className="mt-14 flex flex-col gap-3 sm:flex-row">
                {prev && siblingLink(prev, "prev")}
                {next && siblingLink(next, "next")}
              </div>
            )}

            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="mb-4 font-display text-lg font-semibold text-primary">
                  {t("read_next")}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {related.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="group flex h-full flex-col gap-2 rounded-lg border bg-background p-3 transition-colors hover:border-brand/60 hover:bg-secondary/50"
                      >
                        {item.thumb && (
                          <img
                            src={item.thumb}
                            alt=""
                            loading="lazy"
                            className="h-24 w-full rounded-md object-cover"
                          />
                        )}
                        <span className="font-medium leading-snug text-primary">
                          {t(item.labelKey)}
                        </span>
                        {item.descKey && (
                          <span className="text-xs leading-snug text-muted-foreground">
                            {t(item.descKey)}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Правая панель липкая: оглавление и кнопка подачи остаются на
              виду всё время чтения, а не только в начале страницы. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-8">
              <TableOfContents items={toc} />

              {nextDate && (
                <div className="rounded-lg border bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CalendarClock className="h-4 w-4 text-brand" />
                    {t("rail_deadline_title")}
                  </div>
                  <p className="mt-2 font-display text-lg font-semibold text-primary">
                    {formatDate(nextDate.date, i18n.language)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(nextDate.labelKey)}
                  </p>
                  <Button asChild variant="brand" size="sm" className="mt-4 w-full">
                    <Link to="/app/login">
                      {tApp("site.submitCta")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {group && (
                <nav aria-label={t("section_pages")}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("section_pages")}
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={
                            item.to === pathname
                              ? "block rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-primary"
                              : "block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                          }
                        >
                          {t(item.labelKey)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* Каждая страница заканчивается напоминанием о сроке и кнопкой:
          раньше текст просто обрывался, и выхода к подаче не было. */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              {t("cta_band_title")}
            </h2>
            {nextDate && (
              <p className="mt-1 text-primary-foreground/70">
                {t(nextDate.detailKey)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
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
      </section>
    </>
  );
}
