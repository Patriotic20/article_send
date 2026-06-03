import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import i18n from "@/i18n";
import type { Permission, Role } from "@/types";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => ["roles", "list"] as const,
  permissions: (id: number) => ["roles", "permissions", id] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<Role[]>("/roles/");
      return data;
    },
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<Role>("/roles/", { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(i18n.t("toasts.roleCreated"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.put<Role>(`/roles/${id}`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(i18n.t("toasts.roleUpdated"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(i18n.t("toasts.roleDeleted"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRolePermissions(roleId: number) {
  return useQuery({
    queryKey: roleKeys.permissions(roleId),
    queryFn: async () => {
      const { data } = await api.get<Permission[]>(
        `/roles/${roleId}/permissions`
      );
      return data;
    },
    enabled: Number.isFinite(roleId),
  });
}

export function useAssignPermissionToRole(roleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: number) =>
      api.post(`/roles/${roleId}/permissions/${permissionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.permissions(roleId) });
      toast.success(i18n.t("toasts.permAssigned"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRemovePermissionFromRole(roleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: number) =>
      api.delete(`/roles/${roleId}/permissions/${permissionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.permissions(roleId) });
      toast.success(i18n.t("toasts.permRemoved"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
