from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    total_vehicles = db.query(
        models.Vehicle
    ).count()

    online_vehicles = db.query(
        models.Vehicle
    ).filter(
        models.Vehicle.status == "online"
    ).count()


    active_hazards = db.query(
        models.HazardReport
    ).filter(
        models.HazardReport.status == "ACTIVE"
    ).count()


    high_risk_predictions = db.query(
        models.Prediction
    ).filter(
        models.Prediction.risk_level == "HIGH"
    ).count()


    unread_notifications = db.query(
        models.Notification
    ).filter(
        models.Notification.is_read == False
    ).count()


    # RECENT HAZARDS
    recent_hazards = db.query(
        models.HazardReport
    ).order_by(
        models.HazardReport.reported_at.desc()
    ).limit(5).all()


    # LATEST PREDICTIONS
    latest_predictions = db.query(
        models.Prediction
    ).order_by(
        models.Prediction.predicted_at.desc()
    ).limit(5).all()


    # RECENT NOTIFICATIONS
    recent_notifications = db.query(
        models.Notification
    ).order_by(
        models.Notification.created_at.desc()
    ).limit(5).all()


    # RECENT VEHICLES
    recent_vehicles = db.query(
        models.Vehicle
    ).order_by(
        models.Vehicle.last_updated.desc()
    ).limit(5).all()


    return {
        "summary": {
            "total_vehicles": total_vehicles,
            "online_vehicles": online_vehicles,
            "offline_vehicles": total_vehicles - online_vehicles,
            "active_hazards": active_hazards,
            "high_risk_predictions": high_risk_predictions,
            "unread_notifications": unread_notifications
        },
        "recent_hazards": recent_hazards,
        "latest_predictions": latest_predictions,
        "recent_notifications": recent_notifications,
        "recent_vehicles": recent_vehicles
    }