from pydantic import BaseModel
from datetime import datetime


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str | None = None


class NotificationUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    notification_type: str | None = None
    is_read: bool | None = None


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str | None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True