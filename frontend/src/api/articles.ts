import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import i18n from "@/i18n";
import type {
  Article,
  ArticleCreate,
  ArticleUpdate,
  ArticleUploadResult,
} from "@/types";

export const articleKeys = {
  all: ["articles"] as const,
  list: () => ["articles", "list"] as const,
};

export function useArticles() {
  return useQuery({
    queryKey: articleKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<Article[]>("/articles/");
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
