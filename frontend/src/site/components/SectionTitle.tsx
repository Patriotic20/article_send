import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Заголовок секции в фирменном приёме сайта: янтарный надзаголовок капсом,
 * под ним navy-заголовок, слева вертикальная полоса. Классы sec-title и
 * sec-eyebrow описаны в src/index.css и используются также в кабинете.
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="sec-title max-w-3xl">
        {eyebrow && <div className="sec-eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="font-display text-2xl font-semibold leading-tight text-primary sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
