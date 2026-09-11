import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";

import { isGroup, siteNav } from "@/site/navigation";
import { SUBMISSION_CTA_ENABLED } from "@/site/content/conference";
import logoUrl from "@/assets/logo.png";

const PHONE = "+998 (79) 223-47-16";
const EMAIL = "sharofovich@mail.ru";

/**
 * Подвал в три колонки: конференция, секретариат, разделы сайта.
 * Ссылки собираются из той же структуры меню, что и шапка, — расхождения
 * между навигацией сверху и снизу исключены по построению.
 */
export function SiteFooter() {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();

  const groups = siteNav.filter(isGroup).slice(0, 3);

  return (
    <footer className="mt-auto border-t bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1.4fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 object-contain"
            />
            <span className="max-w-[15rem] font-display text-sm font-semibold leading-snug text-primary">
              {tApp("auth.universityName")}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {tApp("auth.conferenceTitle")}
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {t("main_dates")}
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
            {t("nav_contacts")}
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{t("footer_address")}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <a href={`tel:${PHONE.replace(/[^+\d]/g, "")}`} className="hover:text-foreground">
                {PHONE}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <a href={`mailto:${EMAIL}`} className="hover:text-foreground">
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.labelKey}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
                {t(group.labelKey)}
              </h2>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {group.items.slice(0, 6).map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} {tApp("auth.universityName")}</span>
          {SUBMISSION_CTA_ENABLED && (
            <Link to="/app/login" className="hover:text-foreground">
              {tApp("site.submitCta")}
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
