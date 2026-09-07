import {
  CalendarClock,
  CalendarRange,
  FileCheck2,
  FileText,
  Info,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Структура меню сайта.
 *
 * В навигации используются короткие подписи nav_*, а полные официальные
 * названия (часто набранные капсом) остаются заголовками самих страниц:
 * «FOYDALI QAZILMALARNI QAZIB OLISH VA ISHLAB CHIQARISH» в строке меню
 * не помещается ни на одном экране.
 *
 * У пункта, кроме подписи, есть вторая строка descKey и миниатюра thumb —
 * из них собирается выпадающая панель. Подписи и описания приходят из
 * пространства "site" на трёх языках.
 */
export type NavLeaf = {
  labelKey: string;
  to: string;
  descKey?: string;
  /** Миниатюра для разделов, у которых есть фотографии. */
  thumb?: string;
  /** Иконка для разделов без фотографий — чтобы строки в панели
      сохраняли тот же ритм, что и строки с миниатюрами. */
  icon?: LucideIcon;
};
export type NavGroup = { labelKey: string; items: NavLeaf[] };
export type NavEntry = NavLeaf | NavGroup;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const thumb = (slug: string) => `/media/thumbs/${slug}.webp`;

export const siteNav: NavEntry[] = [
  { labelKey: "menu_home", to: "/" },
  {
    labelKey: "menu_main",
    items: [
      { labelKey: "nav_general", to: "/about", descKey: "desc_general", icon: Info },
      {
        labelKey: "nav_brochure",
        to: "/about/brochure",
        descKey: "desc_brochure",
        icon: FileText,
      },
      {
        labelKey: "nav_conferences",
        to: "/about/conferences",
        descKey: "desc_conferences",
        icon: Landmark,
      },
    ],
  },
  {
    labelKey: "nav_region",
    items: [
      {
        labelKey: "nav_zarafshon",
        to: "/region/zarafshon",
        descKey: "desc_zarafshon",
        thumb: thumb("zarafshon"),
      },
      {
        labelKey: "nav_alisher",
        to: "/region/alisher-navoiy",
        descKey: "desc_alisher",
        thumb: thumb("alisher-navoiy"),
      },
      {
        labelKey: "nav_samarqand",
        to: "/region/samarqand",
        descKey: "desc_samarqand",
        thumb: thumb("samarqand"),
      },
      {
        labelKey: "nav_buxoro",
        to: "/region/buxoro",
        descKey: "desc_buxoro",
        thumb: thumb("buxoro"),
      },
      {
        labelKey: "nav_navoiy",
        to: "/region/navoiy",
        descKey: "desc_navoiy",
        thumb: thumb("navoiy"),
      },
      {
        labelKey: "nav_nurota",
        to: "/region/nurota",
        descKey: "desc_nurota",
        thumb: thumb("nurota"),
      },
      {
        labelKey: "nav_sarmish",
        to: "/region/sarmish",
        descKey: "desc_sarmish",
        thumb: thumb("sarmish"),
      },
    ],
  },
  {
    labelKey: "nav_sections",
    items: [
      {
        labelKey: "nav_mining",
        to: "/sections/mining",
        descKey: "desc_mining",
        thumb: thumb("mining"),
      },
      {
        labelKey: "nav_machinery",
        to: "/sections/machinery",
        descKey: "desc_machinery",
        thumb: thumb("machinery"),
      },
      {
        labelKey: "nav_chemistry",
        to: "/sections/chemistry",
        descKey: "desc_chemistry",
        thumb: thumb("chemistry"),
      },
      {
        labelKey: "nav_energy",
        to: "/sections/energy",
        descKey: "desc_energy",
        thumb: thumb("energy"),
      },
      {
        labelKey: "nav_agriculture",
        to: "/sections/agriculture",
        descKey: "desc_agriculture",
        thumb: thumb("agriculture"),
      },
    ],
  },
  {
    labelKey: "nav_partners",
    items: [
      {
        labelKey: "nav_nkmk",
        to: "/partners/nkmk",
        descKey: "desc_nkmk",
        thumb: thumb("nkmk"),
      },
      {
        labelKey: "nav_navoiyazot",
        to: "/partners/navoiyazot",
        descKey: "desc_navoiyazot",
        thumb: thumb("navoiyazot"),
      },
      {
        labelKey: "nav_tes",
        to: "/partners/tes",
        descKey: "desc_tes",
        thumb: thumb("tes"),
      },
      {
        labelKey: "nav_feiz",
        to: "/partners/feiz",
        descKey: "desc_feiz",
        thumb: thumb("feiz"),
      },
    ],
  },
  {
    labelKey: "nav_authors",
    items: [
      {
        labelKey: "nav_dates",
        to: "/dates",
        descKey: "desc_dates",
        icon: CalendarClock,
      },
      {
        labelKey: "nav_requirements",
        to: "/submission",
        descKey: "desc_requirements",
        icon: FileCheck2,
      },
      {
        labelKey: "nav_committee",
        to: "/committee",
        descKey: "desc_committee",
        icon: Users,
      },
      {
        labelKey: "nav_program",
        to: "/program",
        descKey: "desc_program",
        icon: CalendarRange,
      },
    ],
  },
  { labelKey: "nav_contacts", to: "/contacts" },
];
