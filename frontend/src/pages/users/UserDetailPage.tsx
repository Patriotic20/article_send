import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import {
  useAssignRoleToUser,
  useRemoveRoleFromUser,
  useUser,
  useUserInfo,
  useUserRoles,
} from "@/api/users";
import { useRoles } from "@/api/roles";
import { AssignTransfer } from "@/components/AssignTransfer";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export function UserDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();

  const user = useUser(userId);
  const info = useUserInfo(userId);
  const roles = useUserRoles(userId);
  const allRoles = useRoles();

  const assignRole = useAssignRoleToUser(userId);
  const removeRole = useRemoveRoleFromUser(userId);

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("userDetail.back")}
        </Button>
        <PageHeader
          title={
            user.data
              ? user.data.email
              : t("userDetail.fallbackTitle", { id: userId })
          }
        />
      </div>

      {/* Основные данные */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userDetail.main")}</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryState
            isLoading={user.isLoading}
            isError={user.isError}
            error={user.error}
          />
          {user.data && (
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Field label={t("common.id")} value={String(user.data.id)} />
              <Field label={t("userDetail.email")} value={user.data.email} />
              <Field
                label={t("common.status")}
                value={
                  <Badge variant={user.data.is_online ? "success" : "secondary"}>
                    {user.data.is_online
                      ? t("userDetail.online")
                      : t("userDetail.offline")}
                  </Badge>
                }
              />
              <Field
                label={t("userDetail.createdAt")}
                value={formatDateTime(user.data.created_at)}
              />
              <Field
                label={t("userDetail.updatedAt")}
                value={formatDateTime(user.data.updated_at)}
              />
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Расширенный профиль (user_info) */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userDetail.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Профиль опционален: если info нет — не показываем ничего. */}
          {info.data && (
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Field label={t("userDetail.firstName")} value={info.data.first_name} />
              <Field label={t("userDetail.lastName")} value={info.data.last_name} />
              <Field label={t("userDetail.university")} value={info.data.university} />
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Роли пользователя */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userDetail.roles")}</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryState
            isLoading={roles.isLoading || allRoles.isLoading}
            isError={roles.isError || allRoles.isError}
            error={roles.error ?? allRoles.error}
          />
          {roles.data && allRoles.data && (
            <AssignTransfer
              assigned={roles.data}
              all={allRoles.data}
              assignedTitle={t("userDetail.assignedRoles")}
              availableTitle={t("userDetail.availableRoles")}
              onAssign={(rid) => assignRole.mutate(rid)}
              onRemove={(rid) => removeRole.mutate(rid)}
              pending={assignRole.isPending || removeRole.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
