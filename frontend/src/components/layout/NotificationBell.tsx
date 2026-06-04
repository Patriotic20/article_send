import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";

import {
  useMarkAllRead,
  useNotifications,
  useUnreadCount,
} from "@/api/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  STATUS_VARIANT,
  statusLabelKey,
} from "@/pages/articles/articleStatus";

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: unread = 0 } = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();

  // Закрытие по клику вне панели.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // При открытии помечаем все прочитанными (если есть непрочитанные).
    if (next && unread > 0) markAllRead.mutate();
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={t("notifications.title")}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border bg-popover shadow-lg">
          <div className="border-b px-4 py-2 text-sm font-semibold">
            {t("notifications.title")}
          </div>
          <div className="max-h-96 overflow-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("notifications.empty")}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "border-b px-4 py-3 last:border-b-0",
                    !n.is_read && "bg-accent/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {n.status === "accept"
                        ? t("notifications.accepted")
                        : t("notifications.rejected")}
                    </span>
                    <Badge variant={STATUS_VARIANT[n.status]}>
                      {t(statusLabelKey(n.status))}
                    </Badge>
                  </div>
                  {n.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("notifications.comment")}: {n.comment}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(n.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
