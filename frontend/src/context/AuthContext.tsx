import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchMe, loginRequest, registerRequest } from "@/api/auth";
import { clearTokens, getAccessToken, setTokens } from "@/lib/authTokens";
import { queryClient } from "@/lib/queryClient";
import type { Me, RegisterPayload } from "@/types";

interface AuthContextValue {
  user: Me | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // При старте — если есть токен, подгружаем профиль.
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (active) setUser(me);
      } catch {
        clearTokens();
      } finally {
        if (active) setIsLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Чистим кэш React Query, чтобы не показать данные прошлого пользователя.
    queryClient.clear();
    const tokens = await loginRequest(email, password);
    setTokens(tokens.access_token, tokens.refresh_token);
    setUser(await fetchMe());
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    queryClient.clear();
    const tokens = await registerRequest(data);
    setTokens(tokens.access_token, tokens.refresh_token);
    setUser(await fetchMe());
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    // Сбрасываем кэшированные данные текущего пользователя.
    queryClient.clear();
  }, []);

  const hasPermission = useCallback(
    (permission: string) => !!user?.permissions.includes(permission),
    [user]
  );

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, hasPermission }),
    [user, isLoading, login, register, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
