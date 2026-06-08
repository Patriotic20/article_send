import type { ArticleStatus } from "@/types";

export const ARTICLE_STATUSES: ArticleStatus[] = [
  "pending",
  "accept",
  "rejected",
];

export const STATUS_VARIANT: Record<
  ArticleStatus,
  "warning" | "success" | "destructive"
> = {
  pending: "warning",
  accept: "success",
  rejected: "destructive",
};

// Ключ i18n для ярлыка статуса; перевод берётся через t(statusLabelKey(s)).
export function statusLabelKey(status: ArticleStatus): string {
  return `articles.status.${status}`;
}

// Ключ i18n для ярлыка вкладки статуса (порядок вкладок — ARTICLE_STATUSES).
export function tabLabelKey(status: ArticleStatus): string {
  return `articles.tabs.${status}`;
}
