from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas import LocationCreate, LocationUpdate
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE LOCATION
@router.post("")
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_location = models.Location(
        name=location.name,
        latitude=location.latitude,
        longitude=location.longitude,
        state=location.state
    )

    db.add(new_location)
    db.commit()
    db.refresh(new_location)

    return new_location


# GET ALL LOCATIONS
@router.get("")
def get_locations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(models.Location).all()


# GET SINGLE LOCATION
@router.get("/{location_id}")
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    location = db.query(models.Location).filter(
        models.Location.id == location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    return location


# UPDATE LOCATION
@router.put("/{location_id}")
def update_location(
    location_id: int,
    updated_location: LocationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    location = db.query(models.Location).filter(
        models.Location.id == location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    location.name = updated_location.name
    location.latitude = updated_location.latitude
    location.longitude = updated_location.longitude
    location.state = updated_location.state

    db.commit()
    db.refresh(location)

    return location


# DELETE LOCATION
@router.delete("/{location_id}")
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    location = db.query(models.Location).filter(
        models.Location.id == location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    db.delete(location)
    db.commit()

    return {
        "message": "Location deleted successfully"
    }