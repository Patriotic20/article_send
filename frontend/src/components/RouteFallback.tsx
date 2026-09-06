import { Loader2 } from "lucide-react";

/**
 * Заглушка на время подгрузки чанка маршрута. Внутри AppLayout занимает только
 * контентную область (боковая панель и шапка остаются на месте), с флагом
 * fullscreen — весь экран, для страниц входа и регистрации.
 */
export function RouteFallback({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <div
      className={
        fullscreen
          ? "flex min-h-screen items-center justify-center"
          : "flex min-h-[240px] items-center justify-center py-16"
      }
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
