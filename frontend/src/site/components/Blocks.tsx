import { useTranslation } from "react-i18next";

import type { Block } from "@/site/content/types";

/**
 * Отрисовка блоков контентной страницы. Один блок — один тип разметки;
 * ничего не выводится, если ключ пуст, поэтому неполный перевод даёт
 * пропуск блока, а не пустую рамку с многоточием.
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const { t } = useTranslation("site");

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="mt-4 font-display text-xl font-semibold text-primary sm:text-2xl"
              >
                {t(block.key)}
              </h2>
            );

          case "text": {
            // В текстах старого сайта абзацы разделены переводами строки
            // внутри одного ключа — разворачиваем их в отдельные абзацы,
            // иначе страница читается сплошной простынёй.
            const parts = t(block.key)
              .split(/\n+/)
              .map((part) => part.trim())
              .filter(Boolean);
            return (
              <div key={i} className="flex flex-col gap-4">
                {parts.map((part, j) => (
                  <p key={j} className="leading-relaxed text-foreground/90">
                    {part}
                  </p>
                ))}
              </div>
            );
          }

          case "paragraphs":
            return (
              <div key={i} className="flex flex-col gap-4">
                {block.keys.map((key) => (
                  <p key={key} className="leading-relaxed text-foreground/90">
                    {t(key)}
                  </p>
                ))}
              </div>
            );

          case "list": {
            // returnObjects даёт массив строк — в файлах старого сайта пункты
            // списков хранятся именно так.
            const items = t(block.key, { returnObjects: true });
            if (!Array.isArray(items)) return null;
            return (
              <div key={i}>
                {block.headingKey && (
                  <h3 className="mb-2 font-display text-lg font-semibold text-primary">
                    {t(block.headingKey)}
                  </h3>
                )}
                <ul className="flex flex-col gap-2">
                  {(items as string[]).map((item, j) => (
                    <li key={j} className="flex gap-3 leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                      />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          case "bullets":
            return (
              <div key={i}>
                {block.headingKey && (
                  <h3 className="mb-2 font-display text-lg font-semibold text-primary">
                    {t(block.headingKey)}
                  </h3>
                )}
                <ul className="flex flex-col gap-2">
                  {block.keys.map((key) => (
                    <li key={key} className="flex gap-3 leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                      />
                      <span className="text-foreground/90">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "pending":
            return (
              <p
                key={i}
                className="rounded-lg border border-dashed bg-secondary/50 p-5 text-sm text-muted-foreground"
              >
                {t("content_pending")}
              </p>
            );

          case "image":
            return (
              <figure key={i} className="flex flex-col gap-2">
                <img
                  src={block.src}
                  alt={block.captionKey ? t(block.captionKey) : ""}
                  loading="lazy"
                  className="w-full rounded-lg border object-cover"
                />
                {block.captionKey && (
                  <figcaption className="text-sm text-muted-foreground">
                    {t(block.captionKey)}
                  </figcaption>
                )}
              </figure>
            );

          case "gallery":
            return (
              <div key={i} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {block.images.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-48 w-full rounded-lg border object-cover"
                  />
                ))}
              </div>
            );

          case "facts":
            return (
              <dl
                key={i}
                className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3"
              >
                {block.items.map((item) => (
                  <div key={item.labelKey} className="bg-background p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(item.labelKey)}
                    </dt>
                    <dd className="mt-1 font-display text-xl font-semibold text-primary">
                      {t(item.valueKey)}
                    </dd>
                  </div>
                ))}
              </dl>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
