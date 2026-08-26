from pydantic import BaseModel, Field
from datetime import datetime


class VehicleCreate(BaseModel):
    vehicle_id: str
    name: str | None = None
    vehicle_type: str | None = None

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

    status: str = "offline"


class VehicleUpdate(BaseModel):
    name: str | None = None
    vehicle_type: str | None = None

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

    status: str | None = None


class VehicleResponse(BaseModel):
    id: int
    vehicle_id: str
    name: str | None
    vehicle_type: str | None
    latitude: float | None
    longitude: float | None
    status: str
    last_updated: datetime

    class Config:
        from_attributes = True