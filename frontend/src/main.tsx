import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
// Шрифты отдаём со своего домена: запрос к fonts.googleapis.com блокировал
// первый рендер и зависел от внешней сети. Пакеты variable-версий, поэтому
// весь диапазон насыщенностей — один файл на подмножество символов.
import "@fontsource-variable/inter";
import "@fontsource-variable/jost";
import "@/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Сайт занимает корень, кабинет — /app; префиксы заданы прямо в
        маршрутах App.tsx, поэтому basename здесь не нужен.
        Провайдеры запросов и авторизации живут внутри кабинета (см.
        CabinetProviders): публичным страницам они не нужны, а в стартовом
        бандле занимали бы лишние 40 КБ. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
