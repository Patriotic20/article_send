from datetime import datetime, timezone, timedelta

from pydantic import BaseModel, field_serializer

UZB_TZ = timezone(timedelta(hours=5))


class TimestampSchema(BaseModel):
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def to_uzb_time(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(UZB_TZ).isoformat()
