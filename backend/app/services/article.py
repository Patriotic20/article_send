from app.exceptions import ArticleNotFoundError
from app.repositories.article import ArticleRepository
from app.schemas.article import (
    ArticleCreateRequest,
    ArticleResponse,
    ArticleUpdateRequest,
)


class ArticleService:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    async def get_all(self) -> list[ArticleResponse]:
        return await self.article_repository.list()

    async def get_by_id(self, article_id: int) -> ArticleResponse:
        article = await self.article_repository.get_by_id(article_id)
        if article is None:
            raise ArticleNotFoundError(article_id)
        return article

    async def create_article(
        self, article_create: ArticleCreateRequest
    ) -> ArticleResponse:
        async with self.article_repository.session.begin():
            return await self.article_repository.create(article_create)

    async def update_article(
        self, article_id: int, article_update: ArticleUpdateRequest
    ) -> ArticleResponse:
        async with self.article_repository.session.begin():
            article = await self.article_repository.update(
                article_id, article_update
            )
            if article is None:
                raise ArticleNotFoundError(article_id)
            return article

    async def delete_article(self, article_id: int) -> None:
        async with self.article_repository.session.begin():
            deleted = await self.article_repository.delete(article_id)
            if not deleted:
                raise ArticleNotFoundError(article_id)
