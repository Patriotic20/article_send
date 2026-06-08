from app.exceptions import ArticleNotFoundError, ForbiddenError
from app.models.mixins.article_enum import ArticleStatus
from app.repositories.article import ArticleRepository
from app.repositories.notification import NotificationRepository
from app.schemas.article import (
    ArticleCreateRequest,
    ArticleResponse,
    ArticleReviewRequest,
    ArticleUpdateRequest,
)


class ArticleService:
    def __init__(
        self,
        article_repository: ArticleRepository,
        notification_repository: NotificationRepository | None = None,
    ):
        self.article_repository = article_repository
        self.notification_repository = notification_repository

    async def get_all(
        self,
        user_id: int,
        manage_all: bool,
        status: ArticleStatus | None = None,
    ) -> list[ArticleResponse]:
        # manage_all (admin) видит все; остальные — только свои.
        if manage_all:
            return await self.article_repository.list(status)
        return await self.article_repository.list_by_user(user_id, status)

    async def get_by_id(
        self, article_id: int, user_id: int, manage_all: bool
    ) -> ArticleResponse:
        article = await self.article_repository.get_by_id(article_id)
        if article is None:
            raise ArticleNotFoundError(article_id)
        if not manage_all and article.user_id != user_id:
            raise ForbiddenError("Not your article")
        return article

    async def create_article(
        self, article_create: ArticleCreateRequest, user_id: int
    ) -> ArticleResponse:
        return await self.article_repository.create(article_create, user_id)

    async def update_article(
        self,
        article_id: int,
        article_update: ArticleUpdateRequest,
        user_id: int,
        manage_all: bool,
    ) -> ArticleResponse:
        owner = await self.article_repository.get_owner_id(article_id)
        if owner is None:
            raise ArticleNotFoundError(article_id)
        if not manage_all and owner != user_id:
            raise ForbiddenError("Not your article")
        return await self.article_repository.update(article_id, article_update)

    async def review_article(
        self, article_id: int, review: ArticleReviewRequest
    ) -> ArticleResponse:
        # Принять/отклонить статью и уведомить автора (с комментарием, если есть).
        article = await self.article_repository.get_by_id(article_id)
        if article is None:
            raise ArticleNotFoundError(article_id)
        updated = await self.article_repository.update(
            article_id, ArticleUpdateRequest(status=review.status)
        )
        if self.notification_repository is not None:
            await self.notification_repository.create(
                user_id=article.user_id,
                article_id=article_id,
                status=review.status,
                comment=review.comment,
            )
        return updated

    async def delete_article(
        self, article_id: int, user_id: int, manage_all: bool
    ) -> None:
        owner = await self.article_repository.get_owner_id(article_id)
        if owner is None:
            raise ArticleNotFoundError(article_id)
        if not manage_all and owner != user_id:
            raise ForbiddenError("Not your article")
        await self.article_repository.delete(article_id)
