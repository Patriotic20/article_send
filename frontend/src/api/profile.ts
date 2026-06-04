import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { MyProfile } from "@/types";

export const profileKeys = {
  me: ["profile", "me"] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { data } = await api.get<MyProfile>("/auth/me/profile");
      return data;
    },
  });
}
