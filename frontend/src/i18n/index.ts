import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";

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
    fallbackLng: "uz",
    supportedLngs: ["uz", "ru", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "article_send.lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
