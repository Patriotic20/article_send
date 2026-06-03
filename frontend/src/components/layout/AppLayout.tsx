import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, KeyRound, ShieldCheck, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { CurrentUserSelect } from "./CurrentUserSelect";
import { LanguageSelect } from "./LanguageSelect";

const navItems = [
  { to: "/users", labelKey: "nav.users", icon: Users },
  { to: "/roles", labelKey: "nav.roles", icon: ShieldCheck },
  { to: "/permissions", labelKey: "nav.permissions", icon: KeyRound },
  { to: "/articles", labelKey: "nav.articles", icon: FileText },
];

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="flex w-60 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-6 font-semibold">
          {t("appName")}
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
          <LanguageSelect />
          <CurrentUserSelect />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
