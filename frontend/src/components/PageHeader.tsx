import type { ReactNode } from "react";

/**
 * Заголовок страницы в стиле блока .sec-title с idz.nsumt.uz: вертикальная
 * полоса слева, мелкий янтарный надзаголовок над ним и крупный navy-заголовок.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  // На телефоне кнопка действия уходит под заголовок: рядом они сжимали бы
  // друг друга.
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="sec-title">
        {eyebrow && <div className="sec-eyebrow mb-1">{eyebrow}</div>}
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
