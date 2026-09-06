import { Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";

/**
 * Окружение личного кабинета: клиент запросов, авторизация и всплывающие
 * уведомления. Вынесено из корня приложения, чтобы посетитель сайта
 * конференции не скачивал код, который нужен только после входа.
 */
export function CabinetProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
