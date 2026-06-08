import os
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db_helper import get_session
from app.dependencies import CurrentUser, get_current_user, require_permission
from app.models.mixins.article_enum import ArticleStatus
from app.repositories.article import ArticleRepository
from app.repositories.notification import NotificationRepository
from app.schemas.article import (
    ArticleCreateRequest,
    ArticleResponse,
    ArticleReviewRequest,
    ArticleUpdateRequest,
    ArticleUploadResponse,
)
from app.services.article import ArticleService

router = APIRouter(prefix="/articles", tags=["articles"])

_CHUNK = 1024 * 1024  # 1 МБ
_MANAGE_ALL = "article:manage_all"


def get_article_service(
    session: AsyncSession = Depends(get_session),
) -> ArticleService:
    return ArticleService(
        ArticleRepository(session), NotificationRepository(session)
    )


@router.post(
    "/upload",
    response_model=ArticleUploadResponse,
    dependencies=[Depends(require_permission("article:create"))],
)
async def upload_article_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in settings.allowed_upload_ext_set:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимый тип файла. Разрешены: {settings.allowed_upload_ext}",
        )

    # Раскладываем файлы по подпапкам-годам: uploads/<год>/<uuid>.ext.
    year = str(datetime.now().year)
    subdir = os.path.join(settings.upload_dir, year)
    os.makedirs(subdir, exist_ok=True)
    stored_name = f"{uuid4().hex}{ext}"
    dest = os.path.join(subdir, stored_name)

    size = 0
    try:
        with open(dest, "wb") as out:
            while chunk := await file.read(_CHUNK):
                size += len(chunk)
                if size > settings.max_upload_size:
                    out.close()
                    os.remove(dest)
                    raise HTTPException(
                        status_code=400,
                        detail="Файл слишком большой (максимум 10 МБ).",
                    )
                out.write(chunk)
    finally:
        await file.close()

    return ArticleUploadResponse(
        file_path=f"{settings.upload_dir}/{year}/{stored_name}",
        original_name=file.filename or stored_name,
    )


@router.get("/", response_model=list[ArticleResponse])
async def list_articles(
    scope: str = Query("all", pattern="^(mine|all)$"),
    status: ArticleStatus | None = Query(None),
    current_user: CurrentUser = Depends(require_permission("article:read")),
    service: ArticleService = Depends(get_article_service),
):
    # По умолчанию админ (article:manage_all) видит все статьи, учитель — свои.
    # scope=mine — принудительно только свои (в т.ч. для админа).
    # status (необязательно) — фильтр по вкладке: pending/accept/rejected.
    include_all = scope == "all" and current_user.has(_MANAGE_ALL)
    return await service.get_all(current_user.id, include_all, status)


@router.post(
    "/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED
)
async def create_article(
    article_create: ArticleCreateRequest,
    current_user: CurrentUser = Depends(require_permission("article:create")),
    service: ArticleService = Depends(get_article_service),
):
    return await service.create_article(article_create, current_user.id)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    current_user: CurrentUser = Depends(require_permission("article:read")),
    service: ArticleService = Depends(get_article_service),
):
    return await service.get_by_id(
        article_id, current_user.id, current_user.has(_MANAGE_ALL)
    )


@router.get("/{article_id}/download")
async def download_article_file(
    article_id: int,
    current_user: CurrentUser = Depends(require_permission("article:read")),
    service: ArticleService = Depends(get_article_service),
):
    # get_by_id проверяет доступ/владение и кидает NotFound → 404.
    article = await service.get_by_id(
        article_id, current_user.id, current_user.has(_MANAGE_ALL)
    )
    # Разрешаем путь относительно upload_dir с поддержкой подпапок-годов;
    # realpath внутри upload_dir защищает от path traversal. Обратная
    # совместимость: старые «плоские» пути (uploads/<uuid>.ext) тоже работают.
    rel = os.path.relpath(article.file_path, settings.upload_dir)
    base = os.path.realpath(settings.upload_dir)
    path = os.path.realpath(os.path.join(settings.upload_dir, rel))
    if not (path == base or path.startswith(base + os.sep)) or not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")
    # Скачиваем под исходным именем (кириллица ок), а не под uuid на диске.
    return FileResponse(path, filename=article.original_name or os.path.basename(path))


@router.post("/{article_id}/review", response_model=ArticleResponse)
async def review_article(
    article_id: int,
    review: ArticleReviewRequest,
    current_user: CurrentUser = Depends(require_permission("article:update")),
    service: ArticleService = Depends(get_article_service),
):
    # Принять/отклонить статью с необязательным комментарием → уведомление автору.
    return await service.review_article(article_id, review)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    article_update: ArticleUpdateRequest,
    current_user: CurrentUser = Depends(require_permission("article:update")),
    service: ArticleService = Depends(get_article_service),
):
    return await service.update_article(
        article_id, article_update, current_user.id, current_user.has(_MANAGE_ALL)
    )


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    current_user: CurrentUser = Depends(require_permission("article:delete")),
    service: ArticleService = Depends(get_article_service),
):
    await service.delete_article(
        article_id, current_user.id, current_user.has(_MANAGE_ALL)
    )
