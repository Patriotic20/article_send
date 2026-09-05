import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useReviewArticle } from "@/api/articles";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Article } from "@/types";

type Decision = "accept" | "rejected";

export function ArticleReviewDialog({
  open,
  onOpenChange,
  article,
  decision,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
  decision: Decision;
}) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const review = useReviewArticle();

  const fileName = article
    ? article.original_name || article.file_path.split("/").pop() || ""
    : "";

  useEffect(() => {
    if (open) setComment("");
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    review.mutate(
      {
        id: article.id,
        status: decision,
        comment: comment.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const title =
    decision === "accept"
      ? t("articles.review.confirmAccept")
      : t("articles.review.confirmReject");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-4">
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row"
        >
          <div className="min-h-0 flex-1">
            {article && (
              <DocumentPreview
                key={article.id}
                articleId={article.id}
                fileName={fileName}
              />
            )}
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-72">
            <Label>{t("articles.review.comment")}</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("articles.review.commentPlaceholder")}
              className="min-h-24 flex-1"
            />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={review.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant={decision === "accept" ? "default" : "destructive"}
              disabled={review.isPending}
            >
              {decision === "accept"
                ? t("articles.review.accept")
                : t("articles.review.reject")}
            </Button>
          </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
