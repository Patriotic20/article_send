import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Plus, Search, Trash2 } from "lucide-react";

import { useDeleteUser, useUsers } from "@/api/users";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { UserCreateDialog } from "./UserCreateDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { QueryState } from "@/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";
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
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const canCreate = hasPermission("user:create");
  const canDelete = hasPermission("user:delete");
  const deleteUser = useDeleteUser();

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

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={!!data && data.users.length === 0}
      emptyText={t("users.empty")}
    />
  );

  return (
    <div>
      <PageHeader
        title={t("users.title")}
        action={
          canCreate ? (
            <Button variant="brand" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("users.createUser")}
            </Button>
          ) : undefined
        }
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

      {/* Ширины колонок ниже md не помещаются, поэтому на телефоне таблица
          заменяется списком карточек с теми же данными. */}
      <div className="hidden rounded-md border bg-background md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("common.id")}</TableHead>
              <TableHead>{t("users.email")}</TableHead>
              <TableHead className="w-32">{t("common.status")}</TableHead>
              <TableHead className="w-48">{t("users.createdAt")}</TableHead>
              {canDelete && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((u) => (
              <TableRow
                key={u.id}
                className="cursor-pointer"
                onClick={() => navigate(`/app/users/${u.id}`)}
              >
                <TableCell className="font-mono text-muted-foreground">
                  {u.id}
                </TableCell>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.is_online ? "success" : "secondary"}>
                    {u.is_online ? t("users.online") : t("users.offline")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(u.created_at)}
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(u);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {queryState}
      </div>

      <ul className="space-y-2 md:hidden">
        {data?.users.map((u) => (
          <li
            key={u.id}
            className="flex items-start gap-2 rounded-md border bg-background p-3"
          >
            <div className="min-w-0 flex-1">
              {/* Ссылка, а не onClick на карточке: так работает клавиатура,
                  средняя кнопка мыши и «открыть в новой вкладке». */}
              <Link
                to={`/app/users/${u.id}`}
                className="block truncate font-medium text-primary underline-offset-4 hover:underline"
              >
                {u.email}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono">#{u.id}</span>
                <span>{formatDateTime(u.created_at)}</span>
              </div>
            </div>
            <Badge variant={u.is_online ? "success" : "secondary"}>
              {u.is_online ? t("users.online") : t("users.offline")}
            </Badge>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteTarget(u)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      {/* Тот же элемент состояния для мобильного списка: видимым оказывается
          ровно один из двух. */}
      <div className="md:hidden">{queryState}</div>

      {data && data.users.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-sm">
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

      <UserCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("users.deleteTitle")}
        description={t("users.deleteDesc", { email: deleteTarget?.email })}
        loading={deleteUser.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteUser.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
