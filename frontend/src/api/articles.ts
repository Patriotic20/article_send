import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import i18n from "@/i18n";
import { notificationKeys } from "@/api/notifications";
import type {
  Article,
  ArticleCreate,
  ArticleReview,
  ArticleStatus,
  ArticleUpdate,
  ArticleUploadResult,
} from "@/types";

export const articleKeys = {
  all: ["articles"] as const,
  list: (status?: ArticleStatus) => ["articles", "list", status ?? "all"] as const,
};

// status (необязательно) — фильтр по вкладке статусов на бэкенде.
export function useArticles(status?: ArticleStatus) {
  return useQuery({
    queryKey: articleKeys.list(status),
    queryFn: async () => {
      const { data } = await api.get<Article[]>("/articles/", {
        params: status ? { status } : {},
      });
      return data;
    },
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    // user_id проставляет бэкенд из токена текущего пользователя.
    mutationFn: (payload: ArticleCreate) =>
      api.post<Article>("/articles/", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
      toast.success(i18n.t("toasts.articleCreated"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & ArticleUpdate) =>
      api.put<Article>(`/articles/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
      toast.success(i18n.t("toasts.articleUpdated"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

// Принять/отклонить статью (админ). Бэкенд создаёт уведомление автору.
export function useReviewArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & ArticleReview) =>
      api.post<Article>(`/articles/${id}/review`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(i18n.t("toasts.articleReviewed"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/articles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articleKeys.all });
      toast.success(i18n.t("toasts.articleDeleted"));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

// Скачивание файла статьи через защищённый эндпоинт (с Bearer-токеном).
// Простая ссылка <a href> не подойдёт — токен бы не ушёл, поэтому качаем blob.
export async function downloadArticleFile(id: number, filename: string) {
  const { data } = await api.get(`/articles/${id}/download`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Загрузка файла статьи: multipart → бэкенд сохраняет файл и возвращает путь.
export function useUploadArticleFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<ArticleUploadResult>(
        "/articles/upload",
        form,
        // Content-Type не задаём — браузер сам выставит boundary для multipart.
        { headers: { "Content-Type": undefined } }
      );
      return data;
    },
    onSuccess: () => toast.success(i18n.t("toasts.fileUploaded")),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
