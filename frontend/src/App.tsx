import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { UsersListPage } from "@/pages/users/UsersListPage";
import { UserDetailPage } from "@/pages/users/UserDetailPage";
import { RolesPage } from "@/pages/roles/RolesPage";
import { PermissionsPage } from "@/pages/permissions/PermissionsPage";
import { ArticlesPage } from "@/pages/articles/ArticlesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Route>
    </Routes>
  );
}
