from pydantic import BaseModel, Field
from datetime import datetime


class TelemetryCreate(BaseModel):
    vehicle_id: int

    latitude: float | None = Field(
        None,
        ge=-90,
        le=90
    )

    longitude: float | None = Field(
        None,
        ge=-180,
        le=180
    )

    speed: float | None = Field(
        None,
        ge=0
    )

    heading: float | None = Field(
        None,
        ge=0,
        le=360
    )

    rainfall_rate: float | None = Field(
        None,
        ge=0
    )

    slope: float | None = None

    hazard_status: str = "SAFE"


class TelemetryResponse(BaseModel):
    id: int
    vehicle_id: int

    latitude: float | None
    longitude: float | None

    speed: float | None
    heading: float | None

    rainfall_rate: float | None
    slope: float | None

    hazard_status: str
    recorded_at: datetime

    class Config:
        from_attributes = True