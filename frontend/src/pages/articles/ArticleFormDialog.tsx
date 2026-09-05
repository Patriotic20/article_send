import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileCheck2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateArticle,
  useUpdateArticle,
  useUploadArticleFile,
} from "@/api/articles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Article, ArticleStatus } from "@/types";
import { ARTICLE_STATUSES, statusLabelKey } from "./articleStatus";

const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024;

// Человекочитаемые ограничения для подсказки в форме: "PDF, DOC, DOCX" и 10.
const ALLOWED_LABEL = ALLOWED_EXT.map((e) => e.slice(1).toUpperCase()).join(", ");
const MAX_SIZE_MB = MAX_SIZE / 1024 / 1024;

function baseName(path: string): string {
  return path.split("/").pop() || path;
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  article,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
}) {
  const { t } = useTranslation();
  const isEdit = !!article;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filePath, setFilePath] = useState("");
  const [fileLabel, setFileLabel] = useState(""); // имя для показа
  const [status, setStatus] = useState<ArticleStatus>("pending");

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const uploadFile = useUploadArticleFile();
  const pending = createArticle.isPending || updateArticle.isPending;

  useEffect(() => {
    if (open) {
      setFilePath(article?.file_path ?? "");
      setFileLabel(
        article?.original_name ??
          (article?.file_path ? baseName(article.file_path) : "")
      );
      setStatus(article?.status ?? "pending");
    }
  }, [open, article]);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // позволяем выбрать тот же файл повторно
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      toast.error(t("articles.fileTypeError"));
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(t("articles.fileSizeError"));
      return;
    }

    const result = await uploadFile.mutateAsync(file);
    setFilePath(result.file_path);
    setFileLabel(result.original_name);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath) return;

    if (isEdit && article) {
      updateArticle.mutate(
        {
          id: article.id,
          file_path: filePath,
          original_name: fileLabel || undefined,
          status,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      // user_id и status (pending) проставляет бэкенд — клиент шлёт только файл.
      createArticle.mutate(
        { file_path: filePath, original_name: fileLabel || undefined },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("articles.editTitle") : t("articles.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="min-w-0 space-y-4">
          <div className="space-y-2">
            <Label>{t("articles.fileLabel")}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXT.join(",")}
              className="hidden"
              onChange={onFileChange}
            />
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={onPickFile}
                disabled={uploadFile.isPending}
              >
                {uploadFile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {filePath
                  ? t("articles.replaceButton")
                  : t("articles.uploadButton")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("articles.fileHint", {
                  types: ALLOWED_LABEL,
                  size: MAX_SIZE_MB,
                })}
              </p>
              {filePath && (
                <p
                  className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground"
                  title={fileLabel}
                >
                  <FileCheck2 className="h-4 w-4 shrink-0 text-success" />
                  <span className="truncate">{fileLabel}</span>
                </p>
              )}
            </div>
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>{t("articles.statusLabel")}</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ArticleStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(statusLabelKey(s))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending || uploadFile.isPending || !filePath}
            >
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
