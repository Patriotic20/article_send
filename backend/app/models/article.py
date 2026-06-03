from sqlalchemy import Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base
from app.models.mixins import IdMixin, TimestampMixin
from app.models.mixins.article_enum import ArticleStatus


class Article(IdMixin, TimestampMixin, Base):
    __tablename__ = "articles"

    user_id: Mapped[int] = mapped_column(index=True)
    file_path: Mapped[str]
    status: Mapped[ArticleStatus] = mapped_column(
        Enum(ArticleStatus), default=ArticleStatus.pending
    )
