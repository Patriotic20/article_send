import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import type { PageContent } from "@/site/content/types";
import { Blocks } from "./Blocks";

/**
 * Шаблон текстовой страницы: хлебные крошки, заголовок, обложка и блоки.
 * По нему собраны все перенесённые страницы — о конференции, регионы,
 * научные направления и организаторы.
 */
export function ContentPage({ page }: { page: PageContent }) {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  return (
    <article className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
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
            {t(page.titleKey)}
          </li>
        </ol>
      </nav>

      <header className="sec-title max-w-3xl">
        <div className="sec-eyebrow mb-1.5">{tApp("auth.conferenceShort")}</div>
        <h1 className="font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
          {t(page.titleKey)}
        </h1>
        {page.ledeKey && (
          <p className="mt-4 text-lg text-muted-foreground">{t(page.ledeKey)}</p>
        )}
      </header>

      {page.cover && (
        <img
          src={page.cover}
          alt=""
          className="mt-8 h-[220px] w-full rounded-lg border object-cover sm:h-[340px]"
        />
      )}

      <div className="mt-10 max-w-3xl">
        <Blocks blocks={page.blocks} />
      </div>
    </article>
  );
}
