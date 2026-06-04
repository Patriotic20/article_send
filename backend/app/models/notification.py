from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base
from app.models.mixins import IdMixin, TimestampMixin
from app.models.mixins.article_enum import ArticleStatus


class Notification(IdMixin, TimestampMixin, Base):
    __tablename__ = "notifications"

    # Получатель — автор статьи.
    user_id: Mapped[int] = mapped_column(index=True)
    # Статья, по которой пришло уведомление; при удалении статьи — каскад.
    article_id: Mapped[int | None] = mapped_column(
        ForeignKey("articles.id", ondelete="CASCADE"), index=True
    )
    # Новый статус статьи (accept / rejected).
    status: Mapped[ArticleStatus] = mapped_column(Enum(ArticleStatus))
    # Необязательный комментарий админа (причина).
    comment: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(default=False)
