import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Permission } from "@/types";

export const permissionKeys = {
  all: ["permissions"] as const,
  list: () => ["permissions", "list"] as const,
};

// Разрешения только читаются (никакого create/update/delete в UI).
export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<Permission[]>("/permissions/");
      return data;
    },
  });
}
