import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NamedEntity {
  id: number;
  name: string;
}

// Двухсписочный виджет «назначено / доступно».
// Используется для роль→разрешения и пользователь→роли.
export function AssignTransfer({
  assigned,
  all,
  assignedTitle,
  availableTitle,
  onAssign,
  onRemove,
  pending,
}: {
  assigned: NamedEntity[];
  all: NamedEntity[];
  assignedTitle: string;
  availableTitle: string;
  onAssign: (id: number) => void;
  onRemove: (id: number) => void;
  pending?: boolean;
}) {
  const { t } = useTranslation();
  const assignedIds = useMemo(
    () => new Set(assigned.map((a) => a.id)),
    [assigned]
  );
  const available = useMemo(
    () => all.filter((item) => !assignedIds.has(item.id)),
    [all, assignedIds]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ListColumn
        title={`${assignedTitle} (${assigned.length})`}
        items={assigned}
        emptyText={t("assign.emptyAssigned")}
        actionIcon={<Minus className="h-4 w-4" />}
        onAction={onRemove}
        pending={pending}
      />
      <ListColumn
        title={`${availableTitle} (${available.length})`}
        items={available}
        emptyText={t("assign.emptyAvailable")}
        actionIcon={<Plus className="h-4 w-4" />}
        onAction={onAssign}
        pending={pending}
      />
    </div>
  );
}

function ListColumn({
  title,
  items,
  emptyText,
  actionIcon,
  onAction,
  pending,
}: {
  title: string;
  items: NamedEntity[];
  emptyText: string;
  actionIcon: React.ReactNode;
  onAction: (id: number) => void;
  pending?: boolean;
}) {
  return (
    <div className="rounded-md border">
      <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="max-h-64 overflow-auto p-2">
        {items.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-accent"
              >
                <span>{item.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={pending}
                  onClick={() => onAction(item.id)}
                >
                  {actionIcon}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
