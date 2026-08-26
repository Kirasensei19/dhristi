from pydantic import BaseModel
from datetime import datetime


class WeatherCreate(BaseModel):
    location_id: int

    temperature: float | None = None
    rainfall: float | None = None
    humidity: float | None = None
    wind_speed: float | None = None

    condition: str | None = None


class WeatherResponse(BaseModel):
    id: int
    location_id: int

    temperature: float | None
    rainfall: float | None
    humidity: float | None
    wind_speed: float | None

    condition: str | None
    recorded_at: datetime

    class Config:
        from_attributes = True