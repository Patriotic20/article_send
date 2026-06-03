import axios from "axios";

// Единый axios-инстанс. baseURL = "/api" — в деве Vite проксирует на бэкенд
// (см. vite.config.ts). Когда появится auth, сюда добавим Bearer-токен.
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Аккуратно достаём текст ошибки из ответа FastAPI ({ detail: ... }).
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return error.message;
  }
  return "Неизвестная ошибка";
}
