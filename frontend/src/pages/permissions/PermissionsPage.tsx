import { useTranslation } from "react-i18next";

import { usePermissions } from "@/api/permissions";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export function PermissionsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = usePermissions();

  return (
    <div>
      <PageHeader
        title={t("permissions.title")}
        description={t("permissions.description")}
      />

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("common.id")}</TableHead>
              <TableHead>{t("permissions.name")}</TableHead>
              <TableHead className="w-48">{t("permissions.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {p.id}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(p.created_at)}
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
          emptyText={t("permissions.empty")}
        />
      </div>
    </div>
  );
}
