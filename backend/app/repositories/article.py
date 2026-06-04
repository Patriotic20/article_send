from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.schemas.article import (
    ArticleCreateRequest,
    ArticleResponse,
    ArticleUpdateRequest,
)


class ArticleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_response(self, article: Article) -> ArticleResponse:
        return ArticleResponse(
            id=article.id,
            user_id=article.user_id,
            file_path=article.file_path,
            status=article.status,
            created_at=article.created_at,
            updated_at=article.updated_at,
        )

    async def _get_one(self, article_id: int) -> Article | None:
        return await self.session.get(Article, article_id)

    async def get_by_id(self, article_id: int) -> ArticleResponse | None:
        article = await self._get_one(article_id)
        if article is None:
            return None
        return self._to_response(article)

    async def list(self) -> list[ArticleResponse]:
        result = await self.session.execute(select(Article).order_by(Article.id))
        return [self._to_response(a) for a in result.scalars().all()]

    async def list_by_user(self, user_id: int) -> list[ArticleResponse]:
        result = await self.session.execute(
            select(Article).where(Article.user_id == user_id).order_by(Article.id)
        )
        return [self._to_response(a) for a in result.scalars().all()]

    async def get_owner_id(self, article_id: int) -> int | None:
        article = await self._get_one(article_id)
        return article.user_id if article is not None else None

    async def create(
        self, article_create: ArticleCreateRequest, user_id: int
    ) -> ArticleResponse:
        # status не передаём — сработает дефолт модели ArticleStatus.pending.
        article = Article(
            user_id=user_id,
            file_path=article_create.file_path,
        )
        self.session.add(article)
        await self.session.flush()
        await self.session.refresh(article)
        return self._to_response(article)

    async def update(
        self, article_id: int, article_update: ArticleUpdateRequest
    ) -> ArticleResponse | None:
        article = await self._get_one(article_id)
        if article is None:
            return None
        if article_update.file_path is not None:
            article.file_path = article_update.file_path
        if article_update.status is not None:
            article.status = article_update.status
        await self.session.flush()
        return self._to_response(article)

    async def delete(self, article_id: int) -> bool:
        article = await self._get_one(article_id)
        if article is None:
            return False
        await self.session.delete(article)
        await self.session.flush()
        return True
