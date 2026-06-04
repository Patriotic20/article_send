import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { UsersListPage } from "@/pages/users/UsersListPage";
import { UserDetailPage } from "@/pages/users/UserDetailPage";
import { RolesPage } from "@/pages/roles/RolesPage";
import { PermissionsPage } from "@/pages/permissions/PermissionsPage";
import { ArticlesPage } from "@/pages/articles/ArticlesPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/articles" replace />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/articles" replace />} />
      </Route>
    </Routes>
  );
}
