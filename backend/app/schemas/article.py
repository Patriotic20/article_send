from pydantic import BaseModel, field_validator

from app.models.mixins.article_enum import ArticleStatus
from app.schemas.mixins import TimestampSchema


class ArticleCreateRequest(BaseModel):
    # user_id берётся из токена, status всегда pending — клиент их не передаёт.
    file_path: str


class ArticleUpdateRequest(BaseModel):
    file_path: str | None = None
    status: ArticleStatus | None = None


class ArticleReviewRequest(BaseModel):
    # Решение админа: принять или отклонить, плюс необязательный комментарий.
    status: ArticleStatus
    comment: str | None = None

    @field_validator("status")
    @classmethod
    def status_must_be_decision(cls, v: ArticleStatus) -> ArticleStatus:
        if v not in (ArticleStatus.accept, ArticleStatus.rejected):
            raise ValueError("status must be 'accept' or 'rejected'")
        return v


class ArticleResponse(TimestampSchema):
    id: int
    user_id: int
    file_path: str
    status: ArticleStatus


class ArticleUploadResponse(BaseModel):
    file_path: str
    original_name: str
