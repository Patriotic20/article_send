import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { isGroup, siteNav } from "@/site/navigation";
import logoUrl from "@/assets/logo.png";

/**
 * Шапка сайта: логотип, меню с выпадающими разделами и одна заметная кнопка
 * действия. Липнет к верху при прокрутке; ниже lg превращается в бургер
 * с выдвижной шторкой — тот же приём, что в личном кабинете.
 */
export function SiteHeader() {
  const { t } = useTranslation("site");
  const { t: tApp } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Переход по ссылке закрывает шторку.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const submitButton = (
    <Button asChild variant="brand" size="sm">
      <Link to="/app/login">
        {tApp("site.submitCta")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src={logoUrl}
            alt={tApp("auth.universityName")}
            className="h-10 w-10 shrink-0 object-contain"
          />
          <span className="hidden max-w-[11rem] font-display text-sm font-semibold leading-tight text-primary xl:block">
            {tApp("auth.conferenceShort")}
          </span>
        </Link>

        <NavigationMenu className="mx-auto hidden lg:flex">
          <NavigationMenuList>
            {siteNav.map((entry) =>
              isGroup(entry) ? (
                <NavigationMenuItem key={entry.labelKey}>
                  <NavigationMenuTrigger className="whitespace-nowrap text-sm font-medium">
                    {t(entry.labelKey)}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-[320px] p-2">
                      {entry.items.map((item) => (
                        <li key={item.to}>
                          <NavigationMenuLink asChild>
                            <NavLink
                              to={item.to}
                              className={({ isActive }) =>
                                cn(
                                  "block rounded-md px-3 py-2 text-sm leading-snug transition-colors hover:bg-accent hover:text-accent-foreground",
                                  isActive && "bg-accent font-medium text-primary"
                                )
                              }
                            >
                              {t(item.labelKey)}
                            </NavLink>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={entry.to}>
                  <NavigationMenuLink asChild>
                    <NavLink
                      to={entry.to}
                      end={entry.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "inline-flex h-9 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive && "text-primary"
                        )
                      }
                    >
                      {t(entry.labelKey)}
                    </NavLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden sm:block">{submitButton}</div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={tApp("header.menu")}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Мобильная шторка. Меню длинное (6 разделов, 20 ссылок), поэтому
          разделы показываются раскрытыми списками, а не аккордеоном: так
          до нужной ссылки один жест вместо двух. */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col overflow-y-auto bg-background shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="font-display font-semibold text-primary">
                {t("menu_main")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={tApp("header.closeMenu")}
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-4">
              {siteNav.map((entry) =>
                isGroup(entry) ? (
                  <div key={entry.labelKey}>
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(entry.labelKey)}
                      <ChevronDown className="h-3 w-3" />
                    </div>
                    <ul className="border-l pl-3">
                      {entry.items.map((item) => (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              cn(
                                "block py-1.5 text-sm",
                                isActive
                                  ? "font-medium text-primary"
                                  : "text-foreground/80"
                              )
                            }
                          >
                            {t(item.labelKey)}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <NavLink
                    key={entry.to}
                    to={entry.to}
                    end={entry.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-semibold",
                        isActive ? "text-primary" : "text-foreground/80"
                      )
                    }
                  >
                    {t(entry.labelKey)}
                  </NavLink>
                )
              )}
            </div>

            <div className="mt-auto border-t p-4">{submitButton}</div>
          </nav>
        </div>
      )}
    </header>
  );
}
