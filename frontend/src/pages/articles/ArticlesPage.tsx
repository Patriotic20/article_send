import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useArticles, useDeleteArticle } from "@/api/articles";
import { useCurrentUser } from "@/context/CurrentUserContext";
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
import type { Article } from "@/types";
import { ArticleFormDialog } from "./ArticleFormDialog";
import { STATUS_VARIANT, statusLabelKey } from "./articleStatus";

// Короткое имя файла из пути вида "uploads/<uuid>.pdf".
function fileName(path: string): string {
  return path.split("/").pop() || path;
}

export function ArticlesPage() {
  const { t } = useTranslation();
  const { currentUserId } = useCurrentUser();
  const { data, isLoading, isError, error } = useArticles();
  const deleteArticle = useDeleteArticle();

  const [formOpen, setFormOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const noUser = currentUserId === null;

  const openCreate = () => {
    setEditArticle(null);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={t("articles.title")}
        description={t("articles.description")}
        action={
          <Button
            onClick={openCreate}
            disabled={noUser}
            title={noUser ? t("articles.noUserTooltip") : undefined}
          >
            <Plus className="h-4 w-4" />
            {t("articles.new")}
          </Button>
        }
      />

      {noUser && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("articles.noUserWarning")}
        </div>
      )}

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("common.id")}</TableHead>
              <TableHead className="w-24">{t("articles.userId")}</TableHead>
              <TableHead>{t("articles.file")}</TableHead>
              <TableHead className="w-40">{t("common.status")}</TableHead>
              <TableHead className="w-44">{t("articles.createdAt")}</TableHead>
              <TableHead className="w-28 text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {a.id}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {a.user_id}
                </TableCell>
                <TableCell className="font-medium">
                  <a
                    href={`/api/${a.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {fileName(a.file_path)}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[a.status]}>
                    {t(statusLabelKey(a.status))}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(a.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(a)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!!data && data.length === 0}
          emptyText={t("articles.empty")}
        />
      </div>

      <ArticleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        article={editArticle}
        currentUserId={currentUserId}
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
