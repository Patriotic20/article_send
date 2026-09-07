import { useEffect, useState } from "react";

/**
 * Тонкая полоса прогресса чтения под шапкой. Показывается только на длинных
 * страницах: на короткой прокрутки почти нет, и полоса дёргалась бы от края
 * до края без пользы.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setEnabled(scrollable > window.innerHeight);
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="sticky top-16 z-30 h-0.5 w-full bg-transparent"
    >
      <div
        className="h-full bg-brand transition-[width] duration-150 motion-reduce:transition-none"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
