import type { PageContent } from "./types";

/**
 * Контент перенесённых страниц старого сайта.
 *
 * Порядок блоков снят с исходных HTML-страниц, тексты остались теми же —
 * они приходят из пространства "site" на трёх языках. Там, где старая
 * страница по ошибке выводила чужой ключ, здесь стоит правильный: например
 * tezis.html показывала историю НКМК, хотя текст требований лежит в ключе
 * tezis. Страницы, для которых текста не существует вовсе, помечены блоком
 * pending — заглушка честнее чужого текста.
 */

const ABOUT_PARENT = { labelKey: "menu_main", to: "/about" };
const REGION_PARENT = { labelKey: "nav_region", to: "/region/zarafshon" };
const SECTION_PARENT = { labelKey: "nav_sections", to: "/sections/mining" };
const PARTNER_PARENT = { labelKey: "nav_partners", to: "/partners/nkmk" };

export const aboutPages: Record<string, PageContent> = {
  index: {
    // Заголовок обычным регистром: исходный ключ набран капсом и обрывается
    // двоеточием, а подзаголовок дублировал название конференции из
    // надзаголовка и содержал «V-международной» вместо VII.
    titleKey: "page_about_title",
    shortTitleKey: "nav_general",
    ledeKey: "page_about_lede",
    cover: "/media/university.webp",
    coverCaptionKey: "caption_university",
    blocks: [
      { type: "heading", key: "about_h_resources" },
      { type: "text", key: "paragraph_1" },
      { type: "chips", key: "about_resources", headingKey: "about_resources_title" },
      { type: "heading", key: "about_h_industries" },
      { type: "text", key: "paragraph_2" },
      { type: "heading", key: "about_h_economy" },
      { type: "text", key: "paragraph_3" },
      { type: "heading", key: "about_h_participants" },
      { type: "text", key: "paragraph_3_cont" },
      { type: "quote", key: "about_quote" },
      { type: "heading", key: "about_h_format" },
      { type: "text", key: "paragraph_4" },
      {
        type: "bullets",
        headingKey: "topics_title_topic",
        keys: ["topic_1", "topic_2", "topic_3", "topic_4", "topic_5", "topic_6"],
      },
    ],
  },
  brochure: {
    titleKey: "conference_theme_main",
    shortTitleKey: "nav_brochure",
    parent: ABOUT_PARENT,
    blocks: [{ type: "text", key: "conference_theme_text" }],
  },
  conferences: {
    titleKey: "konferensiya_haqida_main",
    shortTitleKey: "nav_conferences",
    parent: ABOUT_PARENT,
    blocks: [
      { type: "text", key: "konferensiya_haqida" },
      { type: "heading", key: "konferensiya_haqida_main_2" },
      { type: "text", key: "konferensiya_haqida_2" },
    ],
  },
};

export const regionPages: Record<string, PageContent> = {
  zarafshon: {
    titleKey: "nav_zarafshon",
    parent: REGION_PARENT,
    cover: "/media/regions/zarafshon.webp",
    coverCaptionKey: "desc_zarafshon",
    blocks: [
      { type: "text", key: "zarafshon_text_1" },
      { type: "text", key: "zarafshon_text_2" },
      { type: "text", key: "zarafshon_text_3" },
      { type: "heading", key: "zarafshon_subtitle_climate" },
      { type: "text", key: "zarafshon_text_4" },
      { type: "heading", key: "zarafshon_subtitle_qizilqum" },
      { type: "text", key: "zarafshon_text_5" },
      {
        type: "gallery",
        headingKey: "gallery_title",
        images: [
          "/media/regions/zarafshon-2.webp",
          "/media/regions/zarafshon-3.webp",
        ],
      },
    ],
  },
  "alisher-navoiy": {
    titleKey: "nav_alisher",
    parent: REGION_PARENT,
    blocks: [
      { type: "text", key: "alisher_navoiy_text_1" },
      { type: "text", key: "alisher_navoiy_text_2" },
      { type: "text", key: "alisher_navoiy_text_3" },
    ],
  },
  samarqand: {
    titleKey: "nav_samarqand",
    parent: REGION_PARENT,
    cover: "/media/regions/samarqand.webp",
    coverCaptionKey: "desc_samarqand",
    blocks: [
      { type: "heading", key: "samarkand_title_1" },
      { type: "text", key: "samarkand_text_1" },
      { type: "text", key: "samarkand_text_2" },
      { type: "heading", key: "samarkand_title_2" },
      { type: "text", key: "samarkand_text_3" },
      { type: "heading", key: "samarkand_title_3" },
      { type: "text", key: "samarkand_text_4" },
      { type: "heading", key: "samarkand_title_4" },
      { type: "text", key: "samarkand_text_5" },
    ],
  },
  buxoro: {
    titleKey: "nav_buxoro",
    parent: REGION_PARENT,
    cover: "/media/regions/buxoro.webp",
    coverCaptionKey: "desc_buxoro",
    blocks: [
      { type: "heading", key: "buxoro_title_1" },
      { type: "text", key: "buxoro_text_1" },
      { type: "text", key: "buxoro_text_2" },
      { type: "heading", key: "buxoro_title_2" },
      { type: "text", key: "buxoro_text_3" },
      { type: "heading", key: "buxoro_title_3" },
      { type: "text", key: "buxoro_text_4" },
    ],
  },
  navoiy: {
    titleKey: "nav_navoiy",
    parent: REGION_PARENT,
    cover: "/media/regions/navoiy.webp",
    coverCaptionKey: "desc_navoiy",
    blocks: [
      { type: "heading", key: "navoiy_title_1" },
      { type: "text", key: "navoiy_text_1" },
      { type: "heading", key: "navoiy_title_2" },
      { type: "text", key: "navoiy_text_2" },
      { type: "heading", key: "navoiy_title_3" },
      { type: "text", key: "navoiy_text_3" },
    ],
  },
  nurota: {
    titleKey: "nav_nurota",
    parent: REGION_PARENT,
    blocks: [
      { type: "heading", key: "nurota_title_1" },
      { type: "text", key: "nurota_text_1" },
      { type: "heading", key: "nurota_title_2" },
      { type: "text", key: "nurota_text_2" },
    ],
  },
  sarmish: {
    titleKey: "nav_sarmish",
    parent: REGION_PARENT,
    blocks: [
      { type: "heading", key: "sarmish_title_1" },
      { type: "text", key: "sarmish_text_1" },
      { type: "heading", key: "sarmish_title_2" },
      { type: "text", key: "sarmish_text_2" },
    ],
  },
};

export const sectionPages: Record<string, PageContent> = {
  mining: {
    titleKey: "mineral",
    shortTitleKey: "nav_mining",
    parent: SECTION_PARENT,
    blocks: [
      { type: "heading", key: "conference" },
      { type: "text", key: "conference_p1" },
      { type: "text", key: "conference_p2" },
      { type: "text", key: "conference_p3" },
      { type: "text", key: "conference_p4" },
    ],
  },
  machinery: {
    titleKey: "machine_main",
    shortTitleKey: "nav_machinery",
    parent: SECTION_PARENT,
    blocks: [{ type: "text", key: "machine" }],
  },
  chemistry: {
    titleKey: "chemical_main",
    shortTitleKey: "nav_chemistry",
    parent: SECTION_PARENT,
    blocks: [{ type: "text", key: "chemical" }],
  },
  energy: {
    titleKey: "nav_energy",
    parent: SECTION_PARENT,
    blocks: [{ type: "text", key: "energy" }],
  },
  // Своего текста у направления нет: старая страница выводила материал
  // энергетики. Дублировать чужой раздел не стали.
  agriculture: {
    titleKey: "nav_agriculture",
    parent: SECTION_PARENT,
    blocks: [{ type: "pending" }],
  },
};

export const partnerPages: Record<string, PageContent> = {
  nkmk: {
    titleKey: "nav_nkmk",
    parent: PARTNER_PARENT,
    blocks: [{ type: "text", key: "dk" }],
  },
  navoiyazot: {
    titleKey: "nav_navoiyazot",
    parent: PARTNER_PARENT,
    blocks: [{ type: "text", key: "aj" }],
  },
  feiz: {
    titleKey: "eiiz_main",
    shortTitleKey: "nav_feiz",
    parent: PARTNER_PARENT,
    blocks: [{ type: "text", key: "eiiz" }],
  },
  // Старая страница issiqlik.html показывала текст про НКМК; своего описания
  // у теплоэлектростанции нет.
  tes: {
    titleKey: "nav_tes",
    parent: PARTNER_PARENT,
    blocks: [{ type: "pending" }],
  },
};

export const submissionPage: PageContent = {
  titleKey: "page_submission_title",
  shortTitleKey: "nav_requirements",
  parent: { labelKey: "nav_authors", to: "/dates" },
  blocks: [{ type: "text", key: "tezis" }],
};
