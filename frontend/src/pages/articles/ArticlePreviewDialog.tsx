import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { downloadArticleFile } from "@/api/articles";
import { getErrorMessage } from "@/lib/api";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Article } from "@/types";

/** Полноэкранный просмотр файла статьи с возможностью скачать оригинал. */
export function ArticlePreviewDialog({
  open,
  onOpenChange,
  article,
  fileName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
  fileName: string;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-4">
        <DialogHeader className="pr-8">
          <DialogTitle className="truncate" title={fileName}>
            {fileName}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          {article && (
            // key — чтобы при переходе к другой статье просмотр
            // перемонтировался, а не показывал предыдущий документ.
            <DocumentPreview
              key={article.id}
              articleId={article.id}
              fileName={fileName}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close")}
          </Button>
          <Button
            type="button"
            onClick={() =>
              article &&
              downloadArticleFile(article.id, fileName).catch((e) =>
                toast.error(getErrorMessage(e))
              )
            }
          >
            <Download className="h-4 w-4" />
            {t("articles.preview.download")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
