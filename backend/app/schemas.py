from pydantic import BaseModel


class LocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    state: str | None = None
class LocationUpdate(BaseModel):
    name: str
    latitude: float
    longitude: float
    state: str | None = None
class HazardReportCreate(BaseModel):
    location_id: int
    hazard_type: str
    severity: str
    description: str | None = None
class HazardReportUpdate(BaseModel):
    location_id: int
    hazard_type: str
    severity: str
    description: str | None = None
    status: str