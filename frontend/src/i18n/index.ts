import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";
// Тексты сайта конференции. Перенесены как есть из js/lang/*.json старого
// сайта: там уже лежат все три языка, выверенные организаторами, и ключи
// вида menu_general / deadline_tezis используются в контенте страниц.
import siteEn from "./locales/site.en.json";
import siteRu from "./locales/site.ru.json";
import siteUz from "./locales/site.uz.json";

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
      uz: { translation: uz, site: siteUz },
      ru: { translation: ru, site: siteRu },
      en: { translation: en, site: siteEn },
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

export default i18n;
