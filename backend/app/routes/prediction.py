from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas.prediction import (
    PredictionCreate,
    PredictionResponse
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE PREDICTION
@router.post("", response_model=PredictionResponse)
def create_prediction(
    prediction: PredictionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check whether the location exists
    location = db.query(
        models.Location
    ).filter(
        models.Location.id == prediction.location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    new_prediction = models.Prediction(
        location_id=prediction.location_id,
        hazard_type=prediction.hazard_type,
        risk_level=prediction.risk_level,
        confidence=prediction.confidence
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return new_prediction


# GET ALL PREDICTIONS
@router.get("", response_model=list[PredictionResponse])
def get_predictions(
    risk_level: str | None = None,
    hazard_type: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Prediction)

    if risk_level is not None:
        query = query.filter(
            models.Prediction.risk_level == risk_level
        )

    if hazard_type is not None:
        query = query.filter(
            models.Prediction.hazard_type == hazard_type
        )

    return query.order_by(
        models.Prediction.predicted_at.desc()
    ).all()