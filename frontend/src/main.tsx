import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";
// Шрифты отдаём со своего домена: запрос к fonts.googleapis.com блокировал
// первый рендер и зависел от внешней сети. Пакеты variable-версий, поэтому
// весь диапазон насыщенностей — один файл на подмножество символов.
import "@fontsource-variable/inter";
import "@fontsource-variable/jost";
import "@/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Сайт занимает корень, кабинет — /app; префиксы заданы прямо в
          маршрутах App.tsx, поэтому basename здесь не нужен. */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </StrictMode>
);
