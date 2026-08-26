from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False
    )

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    speed = Column(Float, nullable=True)
    heading = Column(Float, nullable=True)

    rainfall_rate = Column(Float, nullable=True)
    slope = Column(Float, nullable=True)

    hazard_status = Column(
        String,
        default="SAFE"
    )

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="telemetry_records"
    )