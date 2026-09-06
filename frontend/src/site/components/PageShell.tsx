import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

/**
 * Каркас страницы со своей вёрсткой (даты, оргкомитет, контакты):
 * те же хлебные крошки и заголовок, что у текстовых страниц, но содержимое
 * задаётся разметкой, а не блоками контента.
 */
export function PageShell({
  title,
  lede,
  parent,
  currentLabel,
  children,
}: {
  title: string;
  lede?: string;
  parent?: { labelKey: string; to: string };
  currentLabel?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground">
              {t("menu_home")}
            </Link>
          </li>
          {parent && (
            <>
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
              <li>
                <Link to={parent.to} className="hover:text-foreground">
                  {t(parent.labelKey)}
                </Link>
              </li>
            </>
          )}
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          <li aria-current="page" className="text-foreground">
            {currentLabel ?? title}
          </li>
        </ol>
      </nav>

      <header className="sec-title mb-10 max-w-3xl">
        <div className="sec-eyebrow mb-1.5">{tApp("auth.conferenceShort")}</div>
        <h1 className="font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
          {title}
        </h1>
        {lede && <p className="mt-4 text-lg text-muted-foreground">{lede}</p>}
      </header>

      {children}
    </div>
  );
}
