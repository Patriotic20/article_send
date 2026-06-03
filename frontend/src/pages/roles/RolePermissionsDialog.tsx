import { useTranslation } from "react-i18next";

import {
  useAssignPermissionToRole,
  useRemovePermissionFromRole,
  useRolePermissions,
} from "@/api/roles";
import { usePermissions } from "@/api/permissions";
import { AssignTransfer } from "@/components/AssignTransfer";
import { QueryState } from "@/components/QueryState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Role } from "@/types";

export function RolePermissionsDialog({
  role,
  onOpenChange,
}: {
  role: Role | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const roleId = role?.id ?? -1;
  const rolePerms = useRolePermissions(roleId);
  const allPerms = usePermissions();
  const assign = useAssignPermissionToRole(roleId);
  const remove = useRemovePermissionFromRole(roleId);

  return (
    <Dialog open={!!role} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("roles.permsTitle", { name: role?.name })}</DialogTitle>
          <DialogDescription>{t("roles.permsDesc")}</DialogDescription>
        </DialogHeader>
        <QueryState
          isLoading={rolePerms.isLoading || allPerms.isLoading}
          isError={rolePerms.isError || allPerms.isError}
          error={rolePerms.error ?? allPerms.error}
        />
        {rolePerms.data && allPerms.data && (
          <AssignTransfer
            assigned={rolePerms.data}
            all={allPerms.data}
            assignedTitle={t("assign.assigned")}
            availableTitle={t("assign.available")}
            onAssign={(pid) => assign.mutate(pid)}
            onRemove={(pid) => remove.mutate(pid)}
            pending={assign.isPending || remove.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
