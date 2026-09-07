import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, FileUp, Menu, X } from "lucide-react";

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
  // Какой раздел раскрыт: нужно, чтобы затемнить страницу под панелью.
  const [openMenu, setOpenMenu] = useState("");

  // Radix со свойством asChild склеивает className строкой, поэтому внутри
  // NavigationMenuLink нельзя передавать функцию ({ isActive }) => … —
  // она попадала в разметку текстом, и классы не применялись. Активный
  // пункт вычисляем по адресу сами.
  const isCurrent = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

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
    // Шторка вынесена из <header> намеренно: backdrop-blur создаёт
    // containing block, и position: fixed внутри него схлопывается до высоты
    // шапки вместо всего экрана.
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          // Пока раскрыта панель, шапка непрозрачна: сквозь полупрозрачный
          // фон просвечивало затемнение страницы и белая шапка сереет.
          openMenu !== "" && "supports-[backdrop-filter]:bg-background"
        )}
      >
        {/* relative — точка отсчёта выпадающих панелей: они растягиваются
            по краям этого контейнера, поэтому у всех разделов общие границы
            и при переходе между ними меняется только содержимое. */}
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={logoUrl}
              alt={tApp("auth.universityName")}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="hidden max-w-[13rem] font-display text-sm font-semibold leading-tight text-primary sm:block">
              {tApp("auth.conferenceShort")}
            </span>
          </Link>

          {/* Десктопное меню включается с 1280, а не с 1024: семь разделов
            с русскими подписями на 1024 не помещались в строку и растягивали
            страницу по горизонтали. Ниже — бургер. */}
        {/* [&>div]:!static — Radix ставит своей внутренней обёртке
            position: relative инлайном, и панель считала бы координаты от
            строки меню, а не от контейнера шапки. Инлайн-стиль перебивается
            только important. */}
        <NavigationMenu
          value={openMenu}
          onValueChange={setOpenMenu}
          className="static mx-auto hidden [&>div]:!static xl:flex"
        >
            <NavigationMenuList>
              {siteNav.map((entry) =>
                isGroup(entry) ? (
                  <NavigationMenuItem key={entry.labelKey}>
                    <NavigationMenuTrigger className="whitespace-nowrap px-3 text-sm font-medium">
                      {t(entry.labelKey)}
                    </NavigationMenuTrigger>
                    {/* Фон панели на тон светлее героя, рамка светлее фона:
                      панель раскрывается поверх тёмно-синего первого экрана,
                      и на одинаковом цвете её края терялись. */}
                  <NavigationMenuContent
                    className="inset-x-4 border-white/20 bg-[hsl(240_60%_13%)] text-primary-foreground sm:inset-x-6"
                  >
                    <div className="p-6">
                      <div className="mb-5 border-b border-white/10 pb-4">
                        <span className="sec-eyebrow">{t(entry.labelKey)}</span>
                      </div>

                      <ul
                        className={cn(
                          "grid gap-1",
                          // Пять и больше пунктов раскладываются в три
                          // колонки, короткие списки — в две: так панель
                          // остаётся невысокой и не превращается в столбик.
                          entry.items.length >= 5
                            ? "grid-cols-3"
                            : "grid-cols-2"
                        )}
                      >
                        {entry.items.map((item) => (
                          <li key={item.to}>
                            <NavigationMenuLink asChild>
                              <NavLink
                                to={item.to}
                                className={cn(
                                  "group/item relative flex items-center gap-3 overflow-hidden rounded-lg p-2.5 transition-colors",
                                  "hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none",
                                  isCurrent(item.to) && "bg-white/10"
                                )}
                              >
                                {/* Янтарная полоса слева — тот же маркер
                                    выбора, что у заголовков секций. */}
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-y-1 left-0 w-0.5 origin-top scale-y-0 rounded-full bg-brand transition-transform duration-200 group-hover/item:scale-y-100 group-focus-visible/item:scale-y-100 motion-reduce:transition-none"
                                />

                                {item.thumb ? (
                                  <img
                                    src={item.thumb}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 shrink-0 rounded-md object-cover brightness-90 transition duration-200 group-hover/item:scale-105 group-hover/item:brightness-110 motion-reduce:transition-none motion-reduce:group-hover/item:scale-100"
                                  />
                                ) : item.icon ? (
                                  <span
                                    aria-hidden="true"
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/10 text-brand transition-colors duration-200 group-hover/item:bg-brand group-hover/item:text-brand-foreground"
                                  >
                                    <item.icon className="h-5 w-5" />
                                  </span>
                                ) : null}
                                <span className="min-w-0">
                                  <span className="block font-medium leading-snug">
                                    {t(item.labelKey)}
                                  </span>
                                  {item.descKey && (
                                    <span className="mt-0.5 block text-xs leading-snug text-primary-foreground/60">
                                      {t(item.descKey)}
                                    </span>
                                  )}
                                </span>
                                <ArrowRight
                                  aria-hidden="true"
                                  className="ml-auto h-4 w-4 shrink-0 -translate-x-1 text-brand opacity-0 transition duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100 motion-reduce:transition-none"
                                />
                              </NavLink>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={entry.to}>
                    <NavigationMenuLink asChild>
                      <NavLink
                        to={entry.to}
                        end={entry.to === "/"}
                        className={cn(
                          "inline-flex h-9 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isCurrent(entry.to) && "bg-accent text-primary"
                        )}
                      >
                        {t(entry.labelKey)}
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <div className="hidden sm:block">{submitButton}</div>
            {/* На самых узких экранах подпись не помещается, но подача тезиса —
                главное действие сайта, поэтому кнопка остаётся, только иконкой. */}
            <Button
              asChild
              variant="brand"
              size="icon"
              className="sm:hidden"
              aria-label={tApp("site.submitCta")}
            >
              <Link to="/app/login">
                <FileUp className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              aria-label={tApp("header.menu")}
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

      </header>

      {/* Затемнение страницы, пока раскрыта панель меню: отделяет её от
          любого фона и заодно показывает, что остальная страница сейчас
          не активна. Ниже шапки по z-index, поэтому сама шапка не гаснет. */}
      {openMenu !== "" && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 hidden bg-black/50 xl:block"
        />
      )}

      {/* Мобильная шторка. Меню длинное (6 разделов, 20 ссылок), поэтому
          разделы показываются раскрытыми списками, а не аккордеоном: так
          до нужной ссылки один жест вместо двух. */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
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
    </>
  );
}
