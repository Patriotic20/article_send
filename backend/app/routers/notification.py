from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_helper import get_session
from app.dependencies import CurrentUser, get_current_user
from app.repositories.notification import NotificationRepository
from app.schemas.notification import NotificationResponse
from app.services.notification import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


def get_notification_service(
    session: AsyncSession = Depends(get_session),
) -> NotificationService:
    return NotificationService(NotificationRepository(session))


@router.get("/", response_model=list[NotificationResponse])
async def list_notifications(
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    return await service.get_for_user(current_user.id)


@router.get("/unread-count")
async def unread_count(
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    return {"count": await service.unread_count(current_user.id)}


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    await service.mark_all_read(current_user.id)
