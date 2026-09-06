import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  FileText,
  KeyRound,
  LogOut,
  Menu,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RouteFallback } from "@/components/RouteFallback";
import { LanguageSelect } from "./LanguageSelect";
import { NotificationBell } from "./NotificationBell";
import logoUrl from "@/assets/logo.png";

// Каждый пункт меню виден только при наличии соответствующего права.
const navItems = [
  { to: "/app/users", labelKey: "nav.users", icon: Users, perm: "user:read" },
  { to: "/app/roles", labelKey: "nav.roles", icon: ShieldCheck, perm: "role:read" },
  {
    to: "/app/permissions",
    labelKey: "nav.permissions",
    icon: KeyRound,
    perm: "permission:read",
  },
  {
    to: "/app/articles",
    labelKey: "nav.articles",
    icon: FileText,
    perm: "article:read",
  },
];

// Общий класс пункта бокового меню: активный помечается янтарной полосой
// слева — так же, как заголовки секций на сайте.
function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:transition-colors",
    isActive
      ? "bg-white/10 text-brand before:bg-brand"
      : "text-white/70 before:bg-transparent hover:bg-white/5 hover:text-white"
  );
}

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout, hasPermission } = useAuth();
  const { pathname } = useLocation();
  // На узких экранах боковая панель превращается в выдвижную шторку.
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleNav = navItems.filter((item) => hasPermission(item.perm));

  // Переход по ссылке закрывает шторку — иначе она осталась бы поверх контента.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Esc закрывает шторку, а фон под ней не должен прокручиваться.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Затемнение под шторкой — только на мобильных. */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Тёмно-синяя боковая панель — отсылка к тёмной шапке idz.nsumt.uz.
          До md она выезжает слева; visibility (а не только сдвиг) убирает
          скрытые ссылки из обхода по Tab. */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-primary-foreground",
          "transition-[transform,visibility] duration-200",
          "md:static md:z-auto md:w-60 md:visible md:translate-x-0",
          menuOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
          {/* Печать университета — тёмно-синяя, поэтому на navy-панели ей
              нужна светлая подложка. */}
          <img
            src={logoUrl}
            alt={t("appName")}
            className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-0.5"
          />
          <span className="truncate font-display text-base font-semibold tracking-wide">
            {t("appName")}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t("header.closeMenu")}
            className="ml-auto rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {visibleNav.map(({ to, labelKey, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
          {/* В шапке ссылка на профиль прячется на узких экранах — здесь она
              остаётся доступной. */}
          <NavLink
            to="/app/profile"
            className={(state) => cn(navLinkClass(state), "md:hidden")}
          >
            <UserCircle className="h-4 w-4" />
            {t("header.profile")}
          </NavLink>
        </nav>

        {/* Возврат на сайт конференции. Сайт и кабинет теперь в одном бандле,
            поэтому это обычный переход роутера, а не перезагрузка страницы. */}
        <Link
          to="/"
          className="mt-auto flex items-center gap-3 border-t border-white/10 px-4 py-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("nav.backToSite")}</span>
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-2 border-b bg-background px-4 sm:gap-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t("header.menu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <LanguageSelect />
            <NotificationBell />
            {user && (
              <NavLink
                to="/app/profile"
                className="hidden max-w-[200px] truncate text-sm text-muted-foreground hover:text-foreground hover:underline lg:block"
              >
                {user.email}
              </NavLink>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("header.logout")}</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Граница загрузки для чанков маршрутов: шапка и меню остаются
              на месте, меняется только контентная область. */}
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
