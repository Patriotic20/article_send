import { useTranslation } from "react-i18next";

import { useAllUsers } from "@/api/users";
import { useCurrentUser } from "@/context/CurrentUserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Временный селектор «текущего пользователя» — пока нет авторизации.
// Выбранный id хранится в localStorage и используется при создании статей.
export function CurrentUserSelect() {
  const { t } = useTranslation();
  const { currentUserId, setCurrentUserId } = useCurrentUser();
  const { data: users, isLoading, isError } = useAllUsers();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t("header.currentUser")}</span>
      <Select
        value={currentUserId !== null ? String(currentUserId) : undefined}
        onValueChange={(v) => setCurrentUserId(Number(v))}
        disabled={isLoading || isError}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue
            placeholder={
              isError ? t("header.loadError") : t("header.selectUser")
            }
          />
        </SelectTrigger>
        <SelectContent>
          {users?.map((u) => (
            <SelectItem key={u.id} value={String(u.id)}>
              #{u.id} — {u.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
