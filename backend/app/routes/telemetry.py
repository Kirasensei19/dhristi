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

    # Auto-detect hazard using AI ML service on incoming telemetry sensors
    from app.services.ml_service import predict_hazard_susceptibility
    
    slope_val = float(telemetry.slope or 0.0)
    rain_rate = float(telemetry.rainfall_rate or 0.0)
    rain_72h = rain_rate * 8.0  # estimate 72h accumulated rain
    
    ml_result = predict_hazard_susceptibility({
        "elevation_m": 850.0,
        "slope_deg": slope_val,
        "aspect_deg": float(telemetry.heading or 180.0),
        "dist_to_river_m": 500.0,
        "dist_to_road_m": 10.0,
        "rainfall_72h_mm": rain_72h,
        "rainfall_24h_mm": rain_rate * 3.0,
        "rainfall_intensity_mmh": rain_rate
    })

    calculated_status = "CRITICAL" if ml_result["risk_level"] == "HIGH" else (
        "WARNING" if ml_result["risk_level"] == "MEDIUM" else "SAFE"
    )

    new_telemetry = models.Telemetry(
        vehicle_id=telemetry.vehicle_id,
        latitude=telemetry.latitude,
        longitude=telemetry.longitude,
        speed=telemetry.speed,
        heading=telemetry.heading,
        rainfall_rate=telemetry.rainfall_rate,
        slope=telemetry.slope,
        hazard_status=calculated_status
    )

    db.add(new_telemetry)

    # Update vehicle's latest position and AI-calculated hazard status
    if telemetry.latitude is not None:
        vehicle.latitude = telemetry.latitude

    if telemetry.longitude is not None:
        vehicle.longitude = telemetry.longitude

    vehicle.status = "online"

    db.commit()
    db.refresh(new_telemetry)

    return {
        "telemetry": new_telemetry,
        "ai_hazard_evaluation": ml_result,
        "auto_detected_status": calculated_status
    }


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