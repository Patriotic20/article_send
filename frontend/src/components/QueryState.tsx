import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

import { getErrorMessage } from "@/lib/api";

// Унифицированные состояния загрузки / ошибки / пустого списка для запросов.
export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyText,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyText?: string;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
        {t("common.errorLoad", { message: getErrorMessage(error) })}
        <div className="mt-1 text-xs text-muted-foreground">
          {t("common.backendHint")}
        </div>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        {emptyText ?? t("common.noData")}
      </div>
    );
  }
  return null;
}
