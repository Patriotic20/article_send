import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";

import { useDeleteRole, useRoles } from "@/api/roles";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/types";
import { RoleFormDialog } from "./RoleFormDialog";
import { RolePermissionsDialog } from "./RolePermissionsDialog";

export function RolesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("role:manage");
  const { data, isLoading, isError, error } = useRoles();
  const deleteRole = useDeleteRole();

  const [formOpen, setFormOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const openCreate = () => {
    setEditRole(null);
    setFormOpen(true);
  };
  const openEdit = (role: Role) => {
    setEditRole(role);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={t("roles.title")}
        action={
          canManage ? (
            <Button variant="brand" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("roles.new")}
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("common.id")}</TableHead>
              <TableHead>{t("roles.name")}</TableHead>
              <TableHead className="w-48">{t("roles.createdAt")}</TableHead>
              <TableHead className="w-[260px] text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {role.id}
                </TableCell>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(role.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  {canManage && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPermRole(role)}
                      >
                        <KeyRound className="h-4 w-4" />
                        {t("roles.permissionsBtn")}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!!data && data.length === 0}
          emptyText={t("roles.empty")}
        />
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={editRole}
      />
      <RolePermissionsDialog
        role={permRole}
        onOpenChange={(open) => !open && setPermRole(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("roles.deleteTitle")}
        description={t("roles.deleteDesc", { name: deleteTarget?.name })}
        loading={deleteRole.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteRole.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
