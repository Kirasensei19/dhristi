from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE NOTIFICATION
@router.post("")
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_notification = models.Notification(
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


# GET ALL NOTIFICATIONS
# GET ALL NOTIFICATIONS
@router.get("")
def get_notifications(
    is_read: bool | None = None,
    notification_type: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Notification)

    if is_read is not None:
        query = query.filter(
            models.Notification.is_read == is_read
        )

    if notification_type is not None:
        query = query.filter(
            models.Notification.notification_type == notification_type
        )

    return query.order_by(
        models.Notification.created_at.desc()
    ).all()


# UPDATE / MARK NOTIFICATION AS READ
@router.put("/{notification_id}")
def update_notification(
    notification_id: int,
    updated_notification: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = db.query(
        models.Notification
    ).filter(
        models.Notification.id == notification_id
    ).first()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    if updated_notification.title is not None:
        notification.title = updated_notification.title

    if updated_notification.message is not None:
        notification.message = updated_notification.message

    if updated_notification.notification_type is not None:
        notification.notification_type = (
            updated_notification.notification_type
        )

    if updated_notification.is_read is not None:
        notification.is_read = updated_notification.is_read

    db.commit()
    db.refresh(notification)

    return notification


# DELETE NOTIFICATION
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = db.query(
        models.Notification
    ).filter(
        models.Notification.id == notification_id
    ).first()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted successfully"
    }