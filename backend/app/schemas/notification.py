from app.models.mixins.article_enum import ArticleStatus
from app.schemas.mixins import TimestampSchema


class NotificationResponse(TimestampSchema):
    id: int
    user_id: int
    article_id: int | None
    status: ArticleStatus
    comment: str | None
    is_read: bool
