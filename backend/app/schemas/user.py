from pydantic import BaseModel, EmailStr

from app.schemas.mixins import (
    PaginationResponseSchema,
    PaginationSchema,
    TimestampSchema,
)


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreateResponse(TimestampSchema):
    id: int
    email: EmailStr
    is_active: bool


class UserListRequest(PaginationSchema):
    email: EmailStr
    
    
class UserListResponse(PaginationResponseSchema):
    users: list[UserCreateResponse]