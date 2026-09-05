import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Download, FileQuestion, Loader2 } from "lucide-react";

import { downloadArticleFile, fetchArticleFile } from "@/api/articles";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Kind = "pdf" | "docx" | "unsupported";

function kindOf(fileName: string): Kind {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  // .doc — старый бинарный формат Word, в браузере не читается.
  return "unsupported";
}

// Обёртка для HTML, полученного из .docx: своя типографика внутри iframe,
// так как стили страницы туда не попадают.
function wrapDocxHtml(body: string): string {
  return `<!doctype html><meta charset="utf-8">
<style>
  /* Шрифты родительской страницы сюда не попадают, а system-ui в отрыве от
     неё разрешается непредсказуемо — поэтому перечисляем реальные гарнитуры. */
  body { margin: 0; padding: 24px 28px; background: #fff; color: #222;
         font-size: 15px; line-height: 1.65;
         font-family: Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial,
                      "Liberation Sans", "DejaVu Sans", sans-serif; }
  h1, h2, h3, h4 { color: #000048; line-height: 1.25; margin: 1.4em 0 .5em; }
  h1 { font-size: 1.6em } h2 { font-size: 1.35em } h3 { font-size: 1.15em }
  p { margin: 0 0 .85em }
  img { max-width: 100%; height: auto }
  table { border-collapse: collapse; margin: 1em 0; width: 100% }
  td, th { border: 1px solid #d8dfeb; padding: 6px 9px; text-align: left }
  a { color: #000048 }
</style>
${body}`;
}

/**
 * Просмотр файла статьи прямо в интерфейсе.
 *
 * PDF отдаём встроенному просмотрщику браузера через blob-ссылку (файл лежит
 * за авторизацией, поэтому обычный src на URL не годится — нужен Bearer).
 * DOCX конвертируем в HTML через mammoth и показываем в iframe с атрибутом
 * sandbox: документ загрузил пользователь, а смотрит его администратор, так что
 * скрипты и ссылки javascript: внутри должны быть обезврежены.
 */
export function DocumentPreview({
  articleId,
  fileName,
}: {
  articleId: number;
  fileName: string;
}) {
  const { t } = useTranslation();
  const kind = kindOf(fileName);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(kind !== "unsupported");

  useEffect(() => {
    if (kind === "unsupported") return;

    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await fetchArticleFile(articleId);
        if (cancelled) return;

        if (kind === "pdf") {
          // Тип проставляем сами: сервер отдаёт файл как вложение, а
          // встроенному просмотрщику нужен именно application/pdf.
          objectUrl = URL.createObjectURL(
            new Blob([blob], { type: "application/pdf" })
          );
          setPdfUrl(objectUrl);
        } else {
          // mammoth тянет за собой распаковщик zip — грузим по требованию,
          // чтобы он не попадал в основной бандл.
          const mammoth = (await import("mammoth")).default;
          const buf = await blob.arrayBuffer();
          if (cancelled) return;
          const { value } = await mammoth.convertToHtml({ arrayBuffer: buf });
          if (cancelled) return;
          setDocxHtml(wrapDocxHtml(value || `<p>${t("articles.preview.empty")}</p>`));
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [articleId, kind, t]);

  const downloadButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        downloadArticleFile(articleId, fileName).catch((e) =>
          setError(getErrorMessage(e))
        )
      }
    >
      <Download className="h-4 w-4" />
      {t("articles.preview.download")}
    </Button>
  );

  if (kind === "unsupported") {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 rounded-md border bg-muted/40 p-6 text-center">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t("articles.preview.unsupported")}
        </p>
        {downloadButton}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center gap-2 rounded-md border bg-muted/40 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("articles.preview.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 rounded-md border bg-muted/40 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        {downloadButton}
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-md border bg-background">
      {kind === "pdf" ? (
        <iframe
          src={pdfUrl ?? undefined}
          title={fileName}
          className="h-full w-full"
        />
      ) : (
        <iframe
          // Пустой sandbox: без скриптов, форм и переходов — содержимое
          // документа считаем недоверенным.
          sandbox=""
          srcDoc={docxHtml ?? undefined}
          title={fileName}
          className="h-full w-full bg-white"
        />
      )}
    </div>
  );
}
