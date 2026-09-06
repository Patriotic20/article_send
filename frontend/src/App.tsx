import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteFallback } from "@/components/RouteFallback";
import { SiteLayout } from "@/site/components/SiteLayout";

// Сайт конференции живёт в корне, личный кабинет — под /app. Один бандл,
// две зоны маршрутизации: пути не пересекаются, поэтому изменения на сайте
// не могут задеть работу кабинета.
const HomePage = lazy(() =>
  import("@/site/pages/HomePage").then((m) => ({ default: m.HomePage }))
);

// Страницы грузятся по требованию: в стартовый бандл попадает только каркас,
// а формы (react-hook-form + zod) и таблицы приезжают вместе со своим экраном.
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const UsersListPage = lazy(() =>
  import("@/pages/users/UsersListPage").then((m) => ({
    default: m.UsersListPage,
  }))
);
const UserDetailPage = lazy(() =>
  import("@/pages/users/UserDetailPage").then((m) => ({
    default: m.UserDetailPage,
  }))
);
const RolesPage = lazy(() =>
  import("@/pages/roles/RolesPage").then((m) => ({ default: m.RolesPage }))
);
const PermissionsPage = lazy(() =>
  import("@/pages/permissions/PermissionsPage").then((m) => ({
    default: m.PermissionsPage,
  }))
);
const ArticlesPage = lazy(() =>
  import("@/pages/articles/ArticlesPage").then((m) => ({
    default: m.ArticlesPage,
  }))
);
const ProfilePage = lazy(() =>
  import("@/pages/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);

export default function App() {
  return (
    // Внешний Suspense — для страниц, которые рендерятся вне AppLayout
    // (сайт, вход, регистрация); у AppLayout есть собственная граница загрузки.
    <Suspense fallback={<RouteFallback fullscreen />}>
      <Routes>
        {/* Сайт конференции */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Кабинет подачи тезисов */}
        <Route path="/app/login" element={<LoginPage />} />
        <Route path="/app/register" element={<RegisterPage />} />

        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/app/articles" replace />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/app/articles" replace />} />
        </Route>

        {/* Пока сайт состоит из одной страницы, всё остальное ведёт на неё.
            На этапе 7 здесь появится настоящая страница 404. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
