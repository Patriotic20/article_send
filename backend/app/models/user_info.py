from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base
from app.models.mixins import IdMixin, TimestampMixin


class UserInfo(IdMixin, TimestampMixin, Base):
    __tablename__ = "user_info"

    user_id: Mapped[int] = mapped_column(unique=True, index=True)
    first_name: Mapped[str]
    last_name: Mapped[str]
    phone_number: Mapped[str] = mapped_column(unique=True, index=True)
    university: Mapped[str]
