from pydantic import BaseModel


class HazardPredictionRequest(BaseModel):

    location_id: int

    elevation_m: float
    slope_deg: float
    aspect_deg: float
    dist_to_river_m: float
    dist_to_road_m: float
    rainfall_72h_mm: float
    rainfall_24h_mm: float
    rainfall_intensity_mmh: float