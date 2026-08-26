from pydantic import BaseModel, Field
from datetime import datetime


class PredictionCreate(BaseModel):
    location_id: int
    hazard_type: str
    risk_level: str

    confidence: float | None = Field(
        None,
        ge=0,
        le=100
    )


class PredictionResponse(BaseModel):
    id: int
    location_id: int
    hazard_type: str
    risk_level: str
    confidence: float | None = None
    predicted_at: datetime

    class Config:
        from_attributes = True