import { api } from "@/lib/api";
import type { Me, RegisterPayload, TokenPair } from "@/types";

export async function loginRequest(
  email: string,
  password: string
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/login", { email, password });
  return data;
}

export async function registerRequest(
  payload: RegisterPayload
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/register", payload);
  return data;
}

export async function fetchMe(): Promise<Me> {
  const { data } = await api.get<Me>("/auth/me");
  return data;
}
