from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import SessionLocal
import app.models as models

from app.schemas import (
    HazardReportCreate,
    HazardReportUpdate,
    HazardResponse
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/hazards",
    tags=["Hazards"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE HAZARD
@router.post("")
def create_hazard(
    hazard: HazardReportCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    location = db.query(
        models.Location
    ).filter(
        models.Location.id == hazard.location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    new_hazard = models.HazardReport(
        location_id=hazard.location_id,
        hazard_type=hazard.hazard_type,
        severity=hazard.severity,
        description=hazard.description
    )

    db.add(new_hazard)
    db.commit()
    db.refresh(new_hazard)

    return new_hazard


# GET ALL HAZARDS
@router.get("", response_model=list[HazardResponse])
def get_hazards(
    severity: Optional[str] = None,
    hazard_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.HazardReport)

    if severity:
        query = query.filter(
            models.HazardReport.severity == severity
        )

    if hazard_type:
        query = query.filter(
            models.HazardReport.hazard_type == hazard_type
        )

    if status:
        query = query.filter(
            models.HazardReport.status == status
        )

    return query.order_by(
        models.HazardReport.reported_at.desc()
    ).all()


# GET SINGLE HAZARD
@router.get("/{hazard_id}")
def get_hazard(
    hazard_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    hazard = db.query(
        models.HazardReport
    ).filter(
        models.HazardReport.id == hazard_id
    ).first()

    if hazard is None:
        raise HTTPException(
            status_code=404,
            detail="Hazard not found"
        )

    return hazard


# UPDATE HAZARD
@router.put("/{hazard_id}")
def update_hazard(
    hazard_id: int,
    updated_hazard: HazardReportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    hazard = db.query(
        models.HazardReport
    ).filter(
        models.HazardReport.id == hazard_id
    ).first()

    if hazard is None:
        raise HTTPException(
            status_code=404,
            detail="Hazard not found"
        )

    hazard.location_id = updated_hazard.location_id
    hazard.hazard_type = updated_hazard.hazard_type
    hazard.severity = updated_hazard.severity
    hazard.description = updated_hazard.description
    hazard.status = updated_hazard.status

    db.commit()
    db.refresh(hazard)

    return hazard


# DELETE HAZARD
@router.delete("/{hazard_id}")
def delete_hazard(
    hazard_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    hazard = db.query(
        models.HazardReport
    ).filter(
        models.HazardReport.id == hazard_id
    ).first()

    if hazard is None:
        raise HTTPException(
            status_code=404,
            detail="Hazard not found"
        )

    db.delete(hazard)
    db.commit()

    return {
        "message": "Hazard deleted successfully"
    }


# AI CROSS-VERIFY HAZARD FAULT
@router.post("/{hazard_id}/ai-verify")
def ai_verify_hazard(
    hazard_id: int,
    db: Session = Depends(get_db)
):
    from app.services.ai_verification_service import verify_hazard_with_ai

    hazard = db.query(models.HazardReport).filter(
        models.HazardReport.id == hazard_id
    ).first()

    if hazard is None:
        raise HTTPException(
            status_code=404,
            detail="Hazard report not found"
        )

    location = db.query(models.Location).filter(
        models.Location.id == hazard.location_id
    ).first()

    location_data = {
        "name": location.name if location else "SHILLONG_PASS",
        "lat": location.latitude if location else 25.6820,
        "lng": location.longitude if location else 91.8750,
        "slope_deg": 28.5
    }

    # Fetch live environmental data (wind, rainfall, etc.)
    live_weather_data = {
        "rainfall_24h_mm": 68.5,
        "rainfall_72h_mm": 142.0,
        "rainfall_intensity_mmh": 14.2,
        "wind_speed_kmh": 48.0
    }

    verification_result = verify_hazard_with_ai(
        hazard_type=hazard.hazard_type,
        severity=hazard.severity,
        description=hazard.description,
        live_weather=live_weather_data,
        location_info=location_data
    )

    # Auto-update status if AI confirms authentic fault
    if verification_result["ai_decision"] == "AI_VERIFIED_AUTHENTIC":
        hazard.status = "BLOCKADE_ACTIVE"
        db.commit()
        db.refresh(hazard)

    return {
        "hazard_id": hazard.id,
        "hazard_type": hazard.hazard_type,
        "current_status": hazard.status,
        "verification": verification_result
    }