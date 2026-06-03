import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useCreateRole, useUpdateRole } from "@/api/roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/types";

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}) {
  const { t } = useTranslation();
  const isEdit = !!role;
  const [name, setName] = useState("");
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const pending = createRole.isPending || updateRole.isPending;

  useEffect(() => {
    if (open) setName(role?.name ?? "");
  }, [open, role]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEdit && role) {
      updateRole.mutate(
        { id: role.id, name: trimmed },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createRole.mutate(trimmed, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("roles.editTitle") : t("roles.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">{t("roles.name")}</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("roles.namePlaceholder")}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
