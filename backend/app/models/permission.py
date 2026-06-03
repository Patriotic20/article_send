from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base
from app.models.mixins import IdMixin, TimestampMixin


class Permission(IdMixin, TimestampMixin, Base):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(unique=True, index=True)
