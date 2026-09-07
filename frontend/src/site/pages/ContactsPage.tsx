import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";

import { PageShell } from "@/site/components/PageShell";
import { PersonCard } from "@/site/components/PersonCard";
import { PartnerStrip } from "@/site/components/PartnerStrip";
import { secretariat } from "@/site/content/conference";

const PHONE = "+998 (79) 223-47-16";
const EMAIL = "sharofovich@mail.ru";

/**
 * Контакты секретариата. Формы обратной связи здесь нет намеренно: на
 * бэкенде нет обработчика писем, а форма, которая молча теряет сообщения,
 * хуже прямой ссылки на почту.
 */
export function ContactsPage() {
  const { t } = useTranslation("site");

  return (
    <>
      <PageShell title={t("nav_contacts")} lede={t("team_text")}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <ul className="flex flex-col gap-5">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("address_title")}
                </p>
                <p className="mt-1">{t("footer_address")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("contact_phone_label")}
                </p>
                <a
                  href={`tel:${PHONE.replace(/[^+\d]/g, "")}`}
                  className="mt-1 block hover:underline"
                >
                  {PHONE}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <a href={`mailto:${EMAIL}`} className="mt-1 block hover:underline">
                  {EMAIL}
                </a>
              </div>
            </li>
          </ul>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-primary">
              {t("team_title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {secretariat.map((person) => (
                <PersonCard
                  key={person.id}
                  nameKey={person.nameKey}
                  positionKey={person.positionKey}
                  photo={person.photo}
                />
              ))}
            </div>
          </div>
        </div>
      </PageShell>
      <PartnerStrip />
    </>
  );
}
