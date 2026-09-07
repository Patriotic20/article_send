import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { headingId, type Block } from "@/site/content/types";

/**
 * Отрисовка блоков контентной страницы. Один блок — один тип разметки;
 * ничего не выводится, если ключ пуст, поэтому неполный перевод даёт
 * пропуск блока, а не пустую рамку с многоточием.
 *
 * У подзаголовков есть якоря — по ним работает оглавление в правой панели.
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const { t } = useTranslation("site");

  // Первый абзац страницы служит вводкой и набирается крупнее остальных.
  const firstTextIndex = blocks.findIndex(
    (b) => b.type === "text" || b.type === "paragraphs"
  );

  const heading = (key: string) => (
    <h2
      id={headingId(key)}
      className="scroll-mt-28 font-display text-xl font-semibold text-primary sm:text-2xl"
    >
      {t(key)}
    </h2>
  );

  // В исходных данных пункты списков начинаются с тире — вместе с нашим
  // маркером получалось «• – ГЕОЛОГИЯ».
  const stripDash = (text: string) => text.replace(/^\s*[–—-]\s*/, "");

  const paragraph = (text: string, lede: boolean, key: string | number) => (
    <p
      key={key}
      className={cn(
        "text-foreground/90",
        lede
          ? "text-lg leading-relaxed sm:text-[19px]"
          : "text-[17px] leading-[1.75]"
      )}
    >
      {text}
    </p>
  );

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        const isLede = i === firstTextIndex;

        switch (block.type) {
          case "heading":
            return <div key={i} className="mt-4">{heading(block.key)}</div>;

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
                {parts.map((part, j) => paragraph(part, isLede && j === 0, j))}
              </div>
            );
          }

          case "paragraphs":
            return (
              <div key={i} className="flex flex-col gap-4">
                {block.keys.map((key, j) =>
                  paragraph(t(key), isLede && j === 0, key)
                )}
              </div>
            );

          case "list": {
            const items = t(block.key, { returnObjects: true });
            if (!Array.isArray(items)) return null;
            return (
              <div key={i} className="flex flex-col gap-3">
                {block.headingKey && heading(block.headingKey)}
                <ul className="flex flex-col gap-2">
                  {(items as string[]).map((item, j) => (
                    <li key={j} className="flex gap-3 text-[17px] leading-[1.7]">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                      />
                      <span className="text-foreground/90">{stripDash(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          case "bullets":
            return (
              <div key={i} className="flex flex-col gap-3">
                {block.headingKey && heading(block.headingKey)}
                <ul className="flex flex-col gap-2">
                  {block.keys.map((key) => (
                    <li key={key} className="flex gap-3 text-[17px] leading-[1.7]">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                      />
                      <span className="text-foreground/90">{stripDash(t(key))}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "chips": {
            const items = t(block.key, { returnObjects: true });
            if (!Array.isArray(items)) return null;
            return (
              <div key={i} className="flex flex-col gap-3">
                {block.headingKey && heading(block.headingKey)}
                <ul className="flex flex-wrap gap-2">
                  {(items as string[]).map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-primary/20 bg-secondary/60 px-3.5 py-1.5 text-sm font-medium text-primary"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-brand py-1 pl-5 font-display text-xl font-medium leading-snug text-primary sm:text-2xl"
              >
                {t(block.key)}
              </blockquote>
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
              <div key={i} className="flex flex-col gap-3">
                {block.headingKey && heading(block.headingKey)}
                <div className="grid gap-3 sm:grid-cols-2">
                  {block.images.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-56 w-full rounded-lg border object-cover"
                    />
                  ))}
                </div>
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
