import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { useUsers } from "@/api/users";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 10;

export function UsersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");

  const { data, isLoading, isError, error } = useUsers({
    page,
    size: PAGE_SIZE,
    email: email || undefined,
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setEmail(emailInput.trim());
  };

  const totalPages = data?.total_pages ?? 1;

  return (
    <div>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
      />

      <form onSubmit={onSearch} className="mb-4 flex max-w-sm gap-2">
        <Input
          placeholder={t("users.searchPlaceholder")}
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
          {t("users.find")}
        </Button>
      </form>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("common.id")}</TableHead>
              <TableHead>{t("users.email")}</TableHead>
              <TableHead className="w-32">{t("common.status")}</TableHead>
              <TableHead className="w-48">{t("users.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((u) => (
              <TableRow
                key={u.id}
                className="cursor-pointer"
                onClick={() => navigate(`/users/${u.id}`)}
              >
                <TableCell className="font-mono text-muted-foreground">
                  {u.id}
                </TableCell>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? "success" : "secondary"}>
                    {u.is_active ? t("users.active") : t("users.inactive")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(u.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!!data && data.users.length === 0}
          emptyText={t("users.empty")}
        />
      </div>

      {data && data.users.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <span className="text-muted-foreground">
            {t("users.pageInfo", {
              page,
              totalPages,
              total: data.total,
            })}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
