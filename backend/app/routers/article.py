import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db_helper import get_session
from app.repositories.article import ArticleRepository
from app.schemas.article import (
    ArticleCreateRequest,
    ArticleResponse,
    ArticleUpdateRequest,
    ArticleUploadResponse,
)
from app.services.article import ArticleService

router = APIRouter(prefix="/articles", tags=["articles"])

_CHUNK = 1024 * 1024  # 1 МБ


def get_article_service(
    session: AsyncSession = Depends(get_session),
) -> ArticleService:
    return ArticleService(ArticleRepository(session))


@router.post("/upload", response_model=ArticleUploadResponse)
async def upload_article_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in settings.allowed_upload_ext_set:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимый тип файла. Разрешены: {settings.allowed_upload_ext}",
        )

    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{uuid4().hex}{ext}"
    dest = os.path.join(settings.upload_dir, stored_name)

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
        file_path=f"{settings.upload_dir}/{stored_name}",
        original_name=file.filename or stored_name,
    )


@router.get("/", response_model=list[ArticleResponse])
async def list_articles(service: ArticleService = Depends(get_article_service)):
    return await service.get_all()


@router.post(
    "/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED
)
async def create_article(
    article_create: ArticleCreateRequest,
    service: ArticleService = Depends(get_article_service),
):
    return await service.create_article(article_create)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    service: ArticleService = Depends(get_article_service),
):
    return await service.get_by_id(article_id)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    article_update: ArticleUpdateRequest,
    service: ArticleService = Depends(get_article_service),
):
    return await service.update_article(article_id, article_update)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    service: ArticleService = Depends(get_article_service),
):
    await service.delete_article(article_id)
