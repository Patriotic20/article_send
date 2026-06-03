from pydantic import BaseModel

from app.schemas.mixins import TimestampSchema


class RoleCreateRequest(BaseModel):
    name: str


class RoleResponse(TimestampSchema):
    id: int
    name: str
