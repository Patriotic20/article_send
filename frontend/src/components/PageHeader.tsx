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
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
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
