import math

from pydantic import BaseModel, Field, computed_field


class PaginationSchema(BaseModel):
    size: int = Field(default=10, gt=0)
    page: int = Field(default=1, gt=0)

    @computed_field
    @property
    def limit(self) -> int:
        return self.size

    @computed_field
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PaginationResponseSchema(PaginationSchema):
    total: int

    @computed_field
    @property
    def total_pages(self) -> int:
        return math.ceil(self.total / self.size) if self.total > 0 else 1
