import { useTranslation } from "react-i18next";

import { useMyProfile } from "@/api/profile";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import { Card, CardContent } from "@/components/ui/card";

export function ProfilePage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useMyProfile();

  const rows: { label: string; value: string | null }[] = data
    ? [
        { label: t("userDetail.email"), value: data.email },
        { label: t("profile.firstName"), value: data.first_name },
        { label: t("profile.lastName"), value: data.last_name },
        { label: t("profile.university"), value: data.university },
      ]
    : [];

  return (
    <div>
      <PageHeader title={t("profile.title")} />

      {data ? (
        <Card>
          <CardContent className="divide-y p-0">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                <span className="text-sm font-medium">
                  {row.value || t("profile.noData")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <QueryState isLoading={isLoading} isError={isError} error={error} />
      )}
    </div>
  );
}
