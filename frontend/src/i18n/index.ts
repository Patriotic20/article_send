import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";
// Тексты сайта конференции перенесены как есть из js/lang/*.json старого
// сайта: там уже лежат все три языка, выверенные организаторами. Словарь
// объёмный (одна статья про НКМК — 11 КБ), поэтому он не в стартовом
// бандле: нужный язык подгружается отдельным чанком, см. loadSiteTexts.

export const LANGUAGES = [
  { code: "uz", label: "Oʻzbek" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
] as const;

export const LOCALE_MAP: Record<string, string> = {
  uz: "uz-Latn",
  ru: "ru-RU",
  en: "en-US",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
    },
    ns: ["translation", "site"],
    defaultNS: "translation",
    fallbackLng: "uz",
    supportedLngs: ["uz", "ru", "en"],
    interpolation: { escapeValue: false },
    detection: {
      // Только сохранённый выбор: посетители приходят с узбекского сайта
      // конференции, и определение по языку браузера подсовывало им
      // английский интерфейс. Без сохранённого выбора работает fallbackLng.
      order: ["localStorage"],
      // Ключ сменён намеренно: прежний детектор писал сюда язык браузера
      // автоматически, и у части посетителей там осел "en". Со старым ключом
      // они продолжили бы видеть английский, несмотря на fallbackLng.
      lookupLocalStorage: "article_send.lang.v2",
      caches: ["localStorage"],
    },
  });

const siteTexts: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  uz: () => import("./locales/site.uz.json"),
  ru: () => import("./locales/site.ru.json"),
  en: () => import("./locales/site.en.json"),
};

/**
 * Подгружает тексты сайта для языка и регистрирует их как пространство
 * "site". Кабинету они не нужны, поэтому загрузка идёт только на страницах
 * сайта — стартовый бандл от этого легче примерно вчетверо.
 */
export async function loadSiteTexts(lng: string): Promise<void> {
  const base = lng?.split("-")[0] ?? "uz";
  const load = siteTexts[base] ?? siteTexts.uz;
  if (i18n.hasResourceBundle(base, "site")) return;
  const module = await load();
  i18n.addResourceBundle(base, "site", module.default, true, true);
}

// Атрибут lang документа должен совпадать с выбранным языком: от него
// зависят переносы, экранные читалки и автоперевод в браузере. В index.html
// он захардкожен как "uz" — здесь синхронизируем с фактическим выбором.
function syncDocumentLang(lng: string) {
  document.documentElement.lang = lng?.split("-")[0] ?? "uz";
}

syncDocumentLang(i18n.language);
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
