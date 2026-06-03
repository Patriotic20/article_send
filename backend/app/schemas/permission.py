from app.schemas.mixins import TimestampSchema


# Разрешения доступны только на чтение — create/update схем нет.
class PermissionResponse(TimestampSchema):
    id: int
    name: str
