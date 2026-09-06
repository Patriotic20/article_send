import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Mail, Send, Youtube } from "lucide-react";

import { LanguageSelect } from "@/components/layout/LanguageSelect";

// Ссылки взяты со старого сайта — те же официальные аккаунты университета.
const socials = [
  {
    href: "https://www.facebook.com/navoiydavlat.konchilikinstituti.1",
    icon: Facebook,
    label: "Facebook",
  },
  { href: "https://t.me/ndktu_rasmiy", icon: Send, label: "Telegram" },
  { href: "https://www.youtube.com/@navdktu4642", icon: Youtube, label: "YouTube" },
  {
    href: "https://www.instagram.com/ndktu_official/",
    icon: Instagram,
    label: "Instagram",
  },
];

const SECRETARY_EMAIL = "sharofovich@mail.ru";

/**
 * Утилитарная полоса над шапкой: соцсети слева, даты и почта справа.
 * На телефоне почта и даты прячутся — там важнее сама навигация.
 */
export function TopBar() {
  const { t } = useTranslation("site");

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <ul className="flex items-center gap-1">
          {socials.map(({ href, icon: Icon, label }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded text-primary-foreground/70 transition-colors hover:bg-white/10 hover:text-brand"
              >
                <Icon className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-5 text-xs">
          <span className="hidden text-primary-foreground/80 sm:inline">
            {t("main_dates")}
          </span>
          <a
            href={`mailto:${SECRETARY_EMAIL}`}
            className="hidden items-center gap-1.5 text-primary-foreground/80 transition-colors hover:text-brand md:flex"
          >
            <Mail className="h-3.5 w-3.5" />
            {SECRETARY_EMAIL}
          </a>
          <LanguageSelect variant="onDark" />
        </div>
      </div>
    </div>
  );
}
