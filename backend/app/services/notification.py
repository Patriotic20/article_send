from app.repositories.notification import NotificationRepository
from app.schemas.notification import NotificationResponse


class NotificationService:
    def __init__(self, notification_repository: NotificationRepository):
        self.notification_repository = notification_repository

    async def get_for_user(self, user_id: int) -> list[NotificationResponse]:
        return await self.notification_repository.list_by_user(user_id)

    async def unread_count(self, user_id: int) -> int:
        return await self.notification_repository.count_unread(user_id)

    async def mark_all_read(self, user_id: int) -> None:
        await self.notification_repository.mark_all_read(user_id)
