import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Pencil, Plus, Trash2, X } from "lucide-react";
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

  const canCreate = hasPermission("article:create");
  const canUpdate = hasPermission("article:update");
  const canDelete = hasPermission("article:delete");
  // Право article:update даёт возможность принимать/отклонять статьи (админ).
  const canReview = canUpdate;
  const showActions = canUpdate || canDelete;
  // Служебные колонки (ID, User ID, дата) — только для админа.
  const isAdmin = hasPermission("article:manage_all");

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
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("articles.new")}
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 inline-flex rounded-md border bg-muted p-1">
        {ARTICLE_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              tab === s
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(tabLabelKey(s))}
          </button>
        ))}
      </div>

      <div className="rounded-md border bg-background">
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
                  <button
                    type="button"
                    title={displayName(a)}
                    onClick={() =>
                      downloadArticleFile(a.id, displayName(a)).catch((e) =>
                        toast.error(getErrorMessage(e))
                      )
                    }
                    className="inline-flex max-w-[480px] items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    <span className="truncate">{displayName(a)}</span>
                  </button>
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
                    <div className="flex justify-end gap-2">
                      {canReview && a.status === "pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-emerald-600 hover:text-emerald-600"
                            title={t("articles.review.accept")}
                            onClick={() =>
                              setReviewTarget({ article: a, decision: "accept" })
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            title={t("articles.review.reject")}
                            onClick={() =>
                              setReviewTarget({
                                article: a,
                                decision: "rejected",
                              })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canUpdate && (
                        <Button
                          size="icon"
                          variant="ghost"
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
                          onClick={() => setDeleteTarget(a)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!!data && data.length === 0}
          emptyText={t(`articles.emptyByStatus.${tab}`)}
        />
      </div>

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
