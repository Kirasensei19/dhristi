from pydantic import BaseModel


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


# Location details inside hazard response
class LocationResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    state: str | None = None

    class Config:
        from_attributes = True


# Hazard response with location details
class HazardResponse(BaseModel):
    id: int
    location_id: int
    hazard_type: str
    severity: str
    description: str | None = None
    status: str

    location: LocationResponse

    class Config:
        from_attributes = True