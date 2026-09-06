import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Заголовок вкладки и описание страницы.
 *
 * Отдельной библиотеки не берём: react-helmet тянет зависимость ради двух
 * тегов, а сайт рендерится на клиенте, где достаточно записать их напрямую.
 * У старого сайта title был пуст на 23 страницах из 24 — во вкладке
 * браузера и в поиске виден был только адрес.
 */
export function PageMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { t } = useTranslation("site");
  const suffix = t("title");

  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ${suffix}` : suffix;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const previousDescription = meta.content;
    if (description) meta.content = description.slice(0, 300);

    return () => {
      document.title = previous;
      if (description) meta.content = previousDescription;
    };
  }, [title, description, suffix]);

  return null;
}
