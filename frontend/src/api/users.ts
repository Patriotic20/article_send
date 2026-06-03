import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import i18n from "@/i18n";
import type { Role, User, UserInfo, UserListResponse } from "@/types";

export interface CreateUserPayload {
  email: string;
  password: string;
}

export const userKeys = {
  all: ["users"] as const,
  list: (params: UsersListParams) => ["users", "list", params] as const,
  detail: (id: number) => ["users", "detail", id] as const,
  info: (id: number) => ["users", "info", id] as const,
  roles: (id: number) => ["users", "roles", id] as const,
};

export interface UsersListParams {
  email?: string;
  size: number;
  page: number;
}

export function useUsers(params: UsersListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<UserListResponse>("/users/", { params });
      return data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      api.post<User>("/users/", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success(i18n.t("toasts.userCreated"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

// Лёгкий список всех пользователей для селектора «текущий пользователь».
export function useAllUsers() {
  return useQuery({
    queryKey: [...userKeys.all, "select"],
    queryFn: async () => {
      const { data } = await api.get<UserListResponse>("/users/", {
        params: { size: 1000, page: 1 },
      });
      return data.users;
    },
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<User>(`/users/${id}`);
      return data;
    },
    enabled: Number.isFinite(id),
  });
}

export function useUserInfo(id: number) {
  return useQuery({
    queryKey: userKeys.info(id),
    queryFn: async () => {
      const { data } = await api.get<UserInfo>(`/users/${id}/info`);
      return data;
    },
    enabled: Number.isFinite(id),
  });
}

export function useUserRoles(id: number) {
  return useQuery({
    queryKey: userKeys.roles(id),
    queryFn: async () => {
      const { data } = await api.get<Role[]>(`/users/${id}/roles`);
      return data;
    },
    enabled: Number.isFinite(id),
  });
}

export function useAssignRoleToUser(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) =>
      api.post(`/users/${userId}/roles/${roleId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.roles(userId) });
      toast.success(i18n.t("toasts.roleAssignedUser"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRemoveRoleFromUser(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) =>
      api.delete(`/users/${userId}/roles/${roleId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.roles(userId) });
      toast.success(i18n.t("toasts.roleRemovedUser"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
