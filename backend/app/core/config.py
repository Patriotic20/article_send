from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+asyncpg://article:article@localhost:5432/article_send"
    )
    cors_origins: str = "http://localhost:5173"

    # Загрузка файлов статей.
    upload_dir: str = "uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10 МБ
    allowed_upload_ext: str = ".pdf,.doc,.docx"

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def allowed_upload_ext_set(self) -> set[str]:
        return {
            ext.strip().lower()
            for ext in self.allowed_upload_ext.split(",")
            if ext.strip()
        }


settings = Settings()
