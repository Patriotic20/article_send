import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env лежит в корне репозитория (рядом с docker-compose.yml), оттуда же
  // берётся BACKEND_PORT: на машине, где 8000 занят другим проектом, порт
  // переопределяют локально, и дев-прокси должен идти следом.
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const backendPort = env.BACKEND_PORT || "8000";

  return {
    // Сайт конференции и кабинет — один бандл в корне: сайт на /, кабинет
    // на /app/. Старые статические страницы (frontend/site) пока лежат рядом
    // и отдаются nginx по своим именам файлов.
    base: "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Вендорные чанки отделены от кода приложения: они меняются редко,
          // поэтому после выката новой версии остаются в кеше браузера.
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            query: ["@tanstack/react-query", "axios"],
            i18n: [
              "i18next",
              "react-i18next",
              "i18next-browser-languagedetector",
            ],
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Бэкенд FastAPI пока без CORS — проксируем /api на него в деве.
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
