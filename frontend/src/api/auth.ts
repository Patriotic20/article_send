import { api } from "@/lib/api";
import type { Me, TokenPair } from "@/types";

export async function loginRequest(
  email: string,
  password: string
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/login", { email, password });
  return data;
}

export async function registerRequest(
  email: string,
  password: string
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/register", {
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<Me> {
  const { data } = await api.get<Me>("/auth/me");
  return data;
}
