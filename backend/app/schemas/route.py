from pydantic import BaseModel
from datetime import datetime


class RouteCreate(BaseModel):
    route_name: str
    start_location: str
    end_location: str

    distance: float | None = None
    estimated_time: float | None = None

    status: str = "active"


class RouteUpdate(BaseModel):
    route_name: str | None = None
    start_location: str | None = None
    end_location: str | None = None

    distance: float | None = None
    estimated_time: float | None = None

    status: str | None = None


class RouteResponse(BaseModel):
    id: int
    route_name: str
    start_location: str
    end_location: str

    distance: float | None
    estimated_time: float | None

    status: str
    created_at: datetime

    class Config:
        from_attributes = True