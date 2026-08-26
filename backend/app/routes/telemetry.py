from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas.telemetry import TelemetryCreate
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE TELEMETRY RECORD
@router.post("")
def create_telemetry(
    telemetry: TelemetryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == telemetry.vehicle_id
    ).first()

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    new_telemetry = models.Telemetry(
        vehicle_id=telemetry.vehicle_id,
        latitude=telemetry.latitude,
        longitude=telemetry.longitude,
        speed=telemetry.speed,
        heading=telemetry.heading,
        rainfall_rate=telemetry.rainfall_rate,
        slope=telemetry.slope,
        hazard_status=telemetry.hazard_status
    )

    db.add(new_telemetry)

    # Update vehicle's latest position
    if telemetry.latitude is not None:
        vehicle.latitude = telemetry.latitude

    if telemetry.longitude is not None:
        vehicle.longitude = telemetry.longitude

    vehicle.status = "online"

    db.commit()
    db.refresh(new_telemetry)

    return new_telemetry


# GET ALL TELEMETRY
@router.get("")
def get_telemetry(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(models.Telemetry).all()


# GET TELEMETRY FOR ONE VEHICLE
@router.get("/vehicle/{vehicle_id}")
def get_vehicle_telemetry(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id
    ).first()

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return db.query(models.Telemetry).filter(
        models.Telemetry.vehicle_id == vehicle_id
    ).all()