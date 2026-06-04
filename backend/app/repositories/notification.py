from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mixins.article_enum import ArticleStatus
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse


class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_response(self, notification: Notification) -> NotificationResponse:
        return NotificationResponse(
            id=notification.id,
            user_id=notification.user_id,
            article_id=notification.article_id,
            status=notification.status,
            comment=notification.comment,
            is_read=notification.is_read,
            created_at=notification.created_at,
            updated_at=notification.updated_at,
        )

    async def create(
        self,
        user_id: int,
        article_id: int,
        status: ArticleStatus,
        comment: str | None,
    ) -> NotificationResponse:
        notification = Notification(
            user_id=user_id,
            article_id=article_id,
            status=status,
            comment=comment,
        )
        self.session.add(notification)
        await self.session.flush()
        await self.session.refresh(notification)
        return self._to_response(notification)

    async def list_by_user(self, user_id: int) -> list[NotificationResponse]:
        result = await self.session.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.id.desc())
        )
        return [self._to_response(n) for n in result.scalars().all()]

    async def count_unread(self, user_id: int) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
        )
        return result.scalar_one()

    async def mark_all_read(self, user_id: int) -> None:
        await self.session.execute(
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .values(is_read=True)
        )
