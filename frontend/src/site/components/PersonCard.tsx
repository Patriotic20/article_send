import { useTranslation } from "react-i18next";

/**
 * Карточка человека: фотография, имя, должность.
 *
 * Где фотографии нет, показываются инициалы — так сетка не разъезжается
 * и сразу видно, каких данных не хватает. Карточка реагирует на наведение
 * и фокус: рамка и фотография подсвечиваются, слева появляется янтарная
 * полоса — тот же маркер, что у заголовков секций.
 */
export function PersonCard({
  nameKey,
  positionKey,
  photo,
}: {
  nameKey: string;
  positionKey: string;
  photo?: string;
}) {
  const { t } = useTranslation("site");
  const name = t(nameKey);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div
      tabIndex={0}
      className="group relative flex gap-4 overflow-hidden rounded-lg border bg-background p-4 outline-none transition-colors hover:border-brand/60 hover:bg-secondary/50 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Янтарная полоса слева выезжает при наведении. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-brand transition-transform duration-200 group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
      />

      {photo ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full border object-cover transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-lg font-semibold text-primary transition-colors group-hover:bg-brand/15"
        >
          {initials}
        </div>
      )}

      <div className="min-w-0">
        <p className="font-display font-semibold leading-snug text-primary">
          {name}
        </p>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          {t(positionKey)}
        </p>
      </div>
    </div>
  );
}
