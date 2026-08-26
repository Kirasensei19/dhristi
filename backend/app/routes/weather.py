from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas.weather import WeatherCreate
from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE WEATHER RECORD
# =========================
@router.post("")
def create_weather(
    weather: WeatherCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    location = db.query(
        models.Location
    ).filter(
        models.Location.id == weather.location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    new_weather = models.WeatherData(
        location_id=weather.location_id,
        temperature=weather.temperature,
        rainfall=weather.rainfall,
        humidity=weather.humidity,
        wind_speed=weather.wind_speed,
        condition=weather.condition
    )

    db.add(new_weather)
    db.commit()
    db.refresh(new_weather)

    return new_weather


# =========================
# GET ALL WEATHER RECORDS
# =========================
@router.get("")
def get_weather(
    location_id: int | None = None,
    condition: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.WeatherData)

    if location_id is not None:
        query = query.filter(
            models.WeatherData.location_id == location_id
        )

    if condition is not None:
        query = query.filter(
            models.WeatherData.condition == condition
        )

    return query.order_by(
        models.WeatherData.recorded_at.desc()
    ).all()


# =========================
# GET LATEST WEATHER
# =========================
@router.get("/latest/{location_id}")
def get_latest_weather(
    location_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    weather = db.query(
        models.WeatherData
    ).filter(
        models.WeatherData.location_id == location_id
    ).order_by(
        models.WeatherData.recorded_at.desc()
    ).first()

    if weather is None:
        raise HTTPException(
            status_code=404,
            detail="No weather data found for this location"
        )

    return weather