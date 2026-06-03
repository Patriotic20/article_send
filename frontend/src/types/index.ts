// Типы под предполагаемый контракт бэкенда (FastAPI / SQLAlchemy модели).
// Все timestamp'ы приходят строками в ISO8601 (таймзона Узбекистана, +05:00).

export interface User {
  id: number;
  email: string;
  is_active: boolean;
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
  phone_number: string;
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
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}

export interface ArticleCreate {
  file_path: string;
  status: ArticleStatus;
  user_id: number; // подставляется автоматически из CurrentUser
}

export interface ArticleUpdate {
  file_path?: string;
  status?: ArticleStatus;
}

export interface ArticleUploadResult {
  file_path: string;
  original_name: string;
}
