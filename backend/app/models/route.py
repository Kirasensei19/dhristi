from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)

    route_name = Column(
        String,
        nullable=False
    )

    start_location = Column(
        String,
        nullable=False
    )

    end_location = Column(
        String,
        nullable=False
    )

    distance = Column(
        Float,
        nullable=True
    )

    estimated_time = Column(
        Float,
        nullable=True
    )

    status = Column(
        String,
        default="active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )