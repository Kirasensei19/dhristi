from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(String, nullable=True)

    vehicle_type = Column(String, nullable=True)

    latitude = Column(Float, nullable=True)

    longitude = Column(Float, nullable=True)

    status = Column(
        String,
        default="offline"
    )

    last_updated = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    telemetry_records = relationship(
        "Telemetry",
        back_populates="vehicle"
    )