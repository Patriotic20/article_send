import { useTranslation } from "react-i18next";

/**
 * Карточка человека: фотография, имя, должность. Пока фотографий нет,
 * вместо аватара показываются инициалы — так сетка не разъезжается и
 * сразу видно, каких данных не хватает.
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
    <div className="flex gap-4 rounded-lg border bg-background p-4">
      {photo ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-full border object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-lg font-semibold text-primary"
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
