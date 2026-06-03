from pydantic import BaseModel

from app.models.mixins.article_enum import ArticleStatus
from app.schemas.mixins import TimestampSchema


class ArticleCreateRequest(BaseModel):
    file_path: str
    status: ArticleStatus = ArticleStatus.pending
    user_id: int


class ArticleUpdateRequest(BaseModel):
    file_path: str | None = None
    status: ArticleStatus | None = None


class ArticleResponse(TimestampSchema):
    id: int
    user_id: int
    file_path: str
    status: ArticleStatus


class ArticleUploadResponse(BaseModel):
    file_path: str
    original_name: str
