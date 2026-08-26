from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False
    )

    hazard_type = Column(String, nullable=False)

    risk_level = Column(String, nullable=False)

    confidence = Column(Float, nullable=True)

    predicted_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    location = relationship("Location")