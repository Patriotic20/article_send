import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, KeyRound, LogOut, ShieldCheck, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LanguageSelect } from "./LanguageSelect";
import { NotificationBell } from "./NotificationBell";
import logoUrl from "@/assets/logo.png";

// Каждый пункт меню виден только при наличии соответствующего права.
const navItems = [
  { to: "/users", labelKey: "nav.users", icon: Users, perm: "user:read" },
  { to: "/roles", labelKey: "nav.roles", icon: ShieldCheck, perm: "role:read" },
  {
    to: "/permissions",
    labelKey: "nav.permissions",
    icon: KeyRound,
    perm: "permission:read",
  },
  {
    to: "/articles",
    labelKey: "nav.articles",
    icon: FileText,
    perm: "article:read",
  },
];

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout, hasPermission } = useAuth();

  const visibleNav = navItems.filter((item) => hasPermission(item.perm));

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Тёмно-синяя боковая панель — отсылка к тёмной шапке idz.nsumt.uz. */}
      <aside className="flex w-60 flex-col bg-primary text-primary-foreground">
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
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {visibleNav.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  // Активный пункт помечается янтарной полосой слева — так же,
                  // как заголовки секций на сайте.
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:transition-colors",
                  isActive
                    ? "bg-white/10 text-brand before:bg-brand"
                    : "text-white/70 before:bg-transparent hover:bg-white/5 hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b bg-background px-6">
          <LanguageSelect />
          <NotificationBell />
          {user && (
            <NavLink
              to="/profile"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {user.email}
            </NavLink>
          )}
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            {t("header.logout")}
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
