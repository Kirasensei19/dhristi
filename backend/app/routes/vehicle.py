from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE VEHICLE
@router.post("")
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing_vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.vehicle_id == vehicle.vehicle_id
    ).first()

    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle ID already exists"
        )

    new_vehicle = models.Vehicle(
        vehicle_id=vehicle.vehicle_id,
        name=vehicle.name,
        vehicle_type=vehicle.vehicle_type,
        latitude=vehicle.latitude,
        longitude=vehicle.longitude,
        status=vehicle.status
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle


# GET ALL VEHICLES
@router.get("")
def get_vehicles(
    status: str | None = None,
    vehicle_type: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Vehicle)

    if status is not None:
        query = query.filter(
            models.Vehicle.status == status
        )

    if vehicle_type is not None:
        query = query.filter(
            models.Vehicle.vehicle_type == vehicle_type
        )

    return query.all()


# GET SINGLE VEHICLE
@router.get("/{vehicle_id}")
def get_vehicle(
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

    return vehicle


# UPDATE VEHICLE
@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    updated_vehicle: VehicleUpdate,
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

    if updated_vehicle.name is not None:
        vehicle.name = updated_vehicle.name

    if updated_vehicle.vehicle_type is not None:
        vehicle.vehicle_type = updated_vehicle.vehicle_type

    if updated_vehicle.latitude is not None:
        vehicle.latitude = updated_vehicle.latitude

    if updated_vehicle.longitude is not None:
        vehicle.longitude = updated_vehicle.longitude

    if updated_vehicle.status is not None:
        vehicle.status = updated_vehicle.status

    db.commit()
    db.refresh(vehicle)

    return vehicle


# DELETE VEHICLE
@router.delete("/{vehicle_id}")
def delete_vehicle(
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

    db.delete(vehicle)
    db.commit()

    return {
        "message": "Vehicle deleted successfully"
    }