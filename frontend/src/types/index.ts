// Типы под предполагаемый контракт бэкенда (FastAPI / SQLAlchemy модели).
// Все timestamp'ы приходят строками в ISO8601 (таймзона Узбекистана, +05:00).

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  users: User[];
  size: number;
  page: number;
  total: number;
  total_pages: number;
}

// Расширенная инфа о пользователе (модель user_info на бэкенде).
export interface UserInfo {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  university: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = "pending" | "accept" | "rejected";

export interface Article {
  id: number;
  user_id: number;
  file_path: string;
  original_name: string | null;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}

export interface ArticleCreate {
  file_path: string;
  original_name?: string;
  // user_id и status (pending) проставляет бэкенд — клиент шлёт только файл.
}

export interface ArticleUpdate {
  file_path?: string;
  original_name?: string;
  status?: ArticleStatus;
}

// Решение админа по статье: принять/отклонить + необязательный комментарий.
export interface ArticleReview {
  status: "accept" | "rejected";
  comment?: string;
}

export interface ArticleUploadResult {
  file_path: string;
  original_name: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Данные многошаговой регистрации (аккаунт + профиль).
export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  university: string;
}

export interface Me {
  id: number;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

// Личный профиль (без роли); поля профиля могут отсутствовать.
export interface MyProfile {
  email: string;
  first_name: string | null;
  last_name: string | null;
  university: string | null;
}

// Уведомление автору о решении по его статье.
export interface AppNotification {
  id: number;
  user_id: number;
  article_id: number | null;
  status: ArticleStatus;
  comment: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
