/**
 * Структура меню сайта.
 *
 * В навигации используются короткие подписи nav_*, а полные официальные
 * названия (часто набранные капсом) остаются заголовками самих страниц:
 * «FOYDALI QAZILMALARNI QAZIB OLISH VA ISHLAB CHIQARISH» в строке меню
 * не помещается ни на одном экране.
 *
 * Подписи берутся из пространства имён "site" — это перенесённые как есть
 * ключи старого сайта (js/lang/*.json), поэтому все три языка приезжают
 * вместе со ссылками и переводить заново ничего не нужно.
 */
export type NavLeaf = { labelKey: string; to: string };
export type NavGroup = { labelKey: string; items: NavLeaf[] };
export type NavEntry = NavLeaf | NavGroup;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

export const siteNav: NavEntry[] = [
  { labelKey: "menu_home", to: "/" },
  {
    labelKey: "menu_main",
    items: [
      { labelKey: "nav_general", to: "/about" },
      { labelKey: "nav_brochure", to: "/about/brochure" },
      { labelKey: "nav_conferences", to: "/about/conferences" },
    ],
  },
  {
    labelKey: "nav_region",
    items: [
      { labelKey: "nav_zarafshon", to: "/region/zarafshon" },
      { labelKey: "nav_alisher", to: "/region/alisher-navoiy" },
      { labelKey: "nav_samarqand", to: "/region/samarqand" },
      { labelKey: "nav_buxoro", to: "/region/buxoro" },
      { labelKey: "nav_navoiy", to: "/region/navoiy" },
      { labelKey: "nav_nurota", to: "/region/nurota" },
      { labelKey: "nav_sarmish", to: "/region/sarmish" },
    ],
  },
  {
    labelKey: "nav_sections",
    items: [
      { labelKey: "nav_mining", to: "/sections/mining" },
      { labelKey: "nav_machinery", to: "/sections/machinery" },
      { labelKey: "nav_chemistry", to: "/sections/chemistry" },
      { labelKey: "nav_energy", to: "/sections/energy" },
      { labelKey: "nav_agriculture", to: "/sections/agriculture" },
    ],
  },
  {
    labelKey: "nav_partners",
    items: [
      { labelKey: "nav_nkmk", to: "/partners/nkmk" },
      { labelKey: "nav_navoiyazot", to: "/partners/navoiyazot" },
      { labelKey: "nav_tes", to: "/partners/tes" },
      { labelKey: "nav_feiz", to: "/partners/feiz" },
    ],
  },
  {
    labelKey: "nav_authors",
    items: [
      { labelKey: "nav_dates", to: "/dates" },
      { labelKey: "nav_requirements", to: "/submission" },
      { labelKey: "nav_committee", to: "/committee" },
      { labelKey: "nav_program", to: "/program" },
    ],
  },
  { labelKey: "nav_contacts", to: "/contacts" },
];
