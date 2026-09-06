import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  downloadArticleFile,
  useArticles,
  useDeleteArticle,
} from "@/api/articles";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Article, ArticleStatus } from "@/types";
import { ArticleFormDialog } from "./ArticleFormDialog";
import { ArticlePreviewDialog } from "./ArticlePreviewDialog";
import { ArticleReviewDialog } from "./ArticleReviewDialog";
import {
  ARTICLE_STATUSES,
  STATUS_VARIANT,
  statusLabelKey,
  tabLabelKey,
} from "./articleStatus";

type ReviewState = { article: Article; decision: "accept" | "rejected" };

// Короткое имя файла из пути вида "uploads/<uuid>.pdf".
function fileName(path: string): string {
  return path.split("/").pop() || path;
}

// Имя для показа/скачивания: исходное имя файла, иначе — uuid из пути.
function displayName(a: Article): string {
  return a.original_name || fileName(a.file_path);
}

export function ArticlesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  // Активная вкладка статуса; по умолчанию — «На рассмотрении».
  const [tab, setTab] = useState<ArticleStatus>("pending");
  const { data, isLoading, isError, error } = useArticles(tab);
  const deleteArticle = useDeleteArticle();

  const [formOpen, setFormOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ReviewState | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Article | null>(null);

  const canCreate = hasPermission("article:create");
  const canUpdate = hasPermission("article:update");
  const canDelete = hasPermission("article:delete");
  // Право article:update даёт возможность принимать/отклонять статьи (админ).
  const canReview = canUpdate;
  const showActions = canUpdate || canDelete;
  // Служебные колонки (ID, User ID, дата) — только для админа.
  const isAdmin = hasPermission("article:manage_all");

  // Кнопки-действия и ссылка на файл одинаковы в таблице и в карточках —
  // держим их в одном месте, чтобы права проверялись ровно один раз.
  const fileLink = (a: Article) => (
    <button
      type="button"
      title={t("articles.preview.open")}
      onClick={() => setPreviewTarget(a)}
      className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-primary underline-offset-4 hover:underline md:max-w-[440px]"
    >
      <Eye className="h-4 w-4 shrink-0" />
      <span className="truncate">{displayName(a)}</span>
    </button>
  );

  const downloadButton = (a: Article) => (
    <Button
      size="icon"
      variant="ghost"
      className="h-7 w-7 shrink-0 text-muted-foreground"
      title={t("articles.preview.download")}
      aria-label={t("articles.preview.download")}
      onClick={() =>
        downloadArticleFile(a.id, displayName(a)).catch((e) =>
          toast.error(getErrorMessage(e))
        )
      }
    >
      <Download className="h-3.5 w-3.5" />
    </Button>
  );

  const rowActions = (a: Article) => (
    <>
      {canReview && a.status === "pending" && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="text-success hover:text-success"
            title={t("articles.review.accept")}
            aria-label={t("articles.review.accept")}
            onClick={() => setReviewTarget({ article: a, decision: "accept" })}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            title={t("articles.review.reject")}
            aria-label={t("articles.review.reject")}
            onClick={() => setReviewTarget({ article: a, decision: "rejected" })}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      {canUpdate && (
        <Button
          size="icon"
          variant="ghost"
          title={t("common.edit")}
          aria-label={t("common.edit")}
          onClick={() => {
            setEditArticle(a);
            setFormOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {canDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          title={t("common.delete")}
          aria-label={t("common.delete")}
          onClick={() => setDeleteTarget(a)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={!!data && data.length === 0}
      emptyText={t(`articles.emptyByStatus.${tab}`)}
    />
  );

  const openCreate = () => {
    setEditArticle(null);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={t("articles.title")}
        action={
          canCreate ? (
            <Button variant="brand" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("articles.new")}
            </Button>
          ) : undefined
        }
      />

      {/* Вкладок четыре, на узком экране они не помещаются — даём полосе
          горизонтальную прокрутку вместо переноса. */}
      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex rounded-md border bg-muted p-1">
          {ARTICLE_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              aria-pressed={tab === s}
              className={cn(
                "whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                tab === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(tabLabelKey(s))}
            </button>
          ))}
        </div>
      </div>

      {/* Таблица со служебными колонками читается только на широком экране;
          ниже md те же статьи показываются карточками. */}
      <div className="hidden rounded-md border bg-background md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <>
                  <TableHead className="w-16">{t("common.id")}</TableHead>
                  <TableHead className="w-24">
                    {t("articles.userId")}
                  </TableHead>
                </>
              )}
              <TableHead>{t("articles.file")}</TableHead>
              <TableHead className="w-40">{t("common.status")}</TableHead>
              {isAdmin && (
                <TableHead className="w-44">
                  {t("articles.createdAt")}
                </TableHead>
              )}
              {showActions && (
                <TableHead className="w-28 text-right">
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((a) => (
              <TableRow key={a.id}>
                {isAdmin && (
                  <>
                    <TableCell className="font-mono text-muted-foreground">
                      {a.id}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {a.user_id}
                    </TableCell>
                  </>
                )}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    {fileLink(a)}
                    {downloadButton(a)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[a.status]}>
                    {t(statusLabelKey(a.status))}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(a.created_at)}
                  </TableCell>
                )}
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">{rowActions(a)}</div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {queryState}
      </div>

      <ul className="space-y-2 md:hidden">
        {data?.map((a) => (
          <li key={a.id} className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-1">
              <div className="min-w-0 flex-1 font-medium">{fileLink(a)}</div>
              {downloadButton(a)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <Badge variant={STATUS_VARIANT[a.status]}>
                {t(statusLabelKey(a.status))}
              </Badge>
              {isAdmin && (
                <>
                  <span className="font-mono">#{a.id}</span>
                  <span>{formatDateTime(a.created_at)}</span>
                </>
              )}
            </div>
            {showActions && (
              <div className="mt-2 flex justify-end gap-1 border-t pt-2">
                {rowActions(a)}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="md:hidden">{queryState}</div>

      <ArticlePreviewDialog
        open={!!previewTarget}
        onOpenChange={(o) => !o && setPreviewTarget(null)}
        article={previewTarget}
        fileName={previewTarget ? displayName(previewTarget) : ""}
      />

      <ArticleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        article={editArticle}
      />
      <ArticleReviewDialog
        open={!!reviewTarget}
        onOpenChange={(open) => !open && setReviewTarget(null)}
        article={reviewTarget?.article ?? null}
        decision={reviewTarget?.decision ?? "accept"}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("articles.deleteTitle")}
        description={t("articles.deleteDesc", { id: deleteTarget?.id })}
        loading={deleteArticle.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteArticle.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
