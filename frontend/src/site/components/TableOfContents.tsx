import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/** Оглавление страницы с подсветкой текущего раздела. */
export function TableOfContents({
  items,
}: {
  items: { id: string; key: string }[];
}) {
  const { t } = useTranslation("site");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // Активным считается последний заголовок, который ушёл выше линии
    // чтения под шапкой. IntersectionObserver здесь давал пробелы: между
    // длинными разделами ни один заголовок не попадал в узкую полосу
    // наблюдения, и подсветка пропадала совсем.
    const READING_LINE = 140;

    const update = () => {
      let current: string | null = null;
      for (const item of items) {
        const node = document.getElementById(item.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= READING_LINE) current = item.id;
      }
      setActiveId(current ?? items[0].id);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-labelledby="toc-title">
      <h2
        id="toc-title"
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {t("toc_title")}
      </h2>
      <ul className="flex flex-col border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors",
                activeId === item.id
                  ? "border-brand font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {t(item.key)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
