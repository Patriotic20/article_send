import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // SPA живёт на /app/, а в корне отдаётся статический сайт конференции
  // (frontend/site). Без base ассеты запрашивались бы из корня и попадали
  // бы на файлы сайта.
  base: "/app/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Бэкенд FastAPI пока без CORS — проксируем /api на него в деве.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
