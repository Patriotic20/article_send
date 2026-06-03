import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import { CurrentUserProvider } from "@/context/CurrentUserContext";
import { queryClient } from "@/lib/queryClient";
import "@/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CurrentUserProvider>
          <App />
        </CurrentUserProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </StrictMode>
);
