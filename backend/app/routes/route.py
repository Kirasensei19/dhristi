from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models

from app.schemas.route import (
    RouteCreate,
    RouteUpdate
)

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# CREATE ROUTE
@router.post("")
def create_route(
    route: RouteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_route = models.Route(
        route_name=route.route_name,
        start_location=route.start_location,
        end_location=route.end_location,
        distance=route.distance,
        estimated_time=route.estimated_time,
        status=route.status
    )

    db.add(new_route)
    db.commit()
    db.refresh(new_route)

    return new_route


# GET ALL ROUTES
@router.get("")
def get_routes(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Route)

    if status is not None:
        query = query.filter(
            models.Route.status == status
        )

    return query.all()


# GET SINGLE ROUTE
# GET ALL ROUTES
@router.get("")
def get_routes(
    status: str | None = None,
    start_location: str | None = None,
    end_location: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Route)

    if status is not None:
        query = query.filter(
            models.Route.status == status
        )

    if start_location is not None:
        query = query.filter(
            models.Route.start_location == start_location
        )

    if end_location is not None:
        query = query.filter(
            models.Route.end_location == end_location
        )

    return query.all()


# UPDATE ROUTE
@router.put("/{route_id}")
def update_route(
    route_id: int,
    updated_route: RouteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    route = db.query(models.Route).filter(
        models.Route.id == route_id
    ).first()

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    if updated_route.route_name is not None:
        route.route_name = updated_route.route_name

    if updated_route.start_location is not None:
        route.start_location = updated_route.start_location

    if updated_route.end_location is not None:
        route.end_location = updated_route.end_location

    if updated_route.distance is not None:
        route.distance = updated_route.distance

    if updated_route.estimated_time is not None:
        route.estimated_time = updated_route.estimated_time

    if updated_route.status is not None:
        route.status = updated_route.status

    db.commit()
    db.refresh(route)

    return route


# DELETE ROUTE
@router.delete("/{route_id}")
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    route = db.query(models.Route).filter(
        models.Route.id == route_id
    ).first()

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    db.delete(route)
    db.commit()

    return {
        "message": "Route deleted successfully"
    }