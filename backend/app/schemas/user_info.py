from app.schemas.mixins import TimestampSchema


class UserInfoResponse(TimestampSchema):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone_number: str
    university: str
