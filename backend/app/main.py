from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models

import app.routes.location as locations
import app.routes.hazards as hazards
import app.routes.prediction as prediction
import app.routes.vehicle as vehicles
import app.routes.telemetry as telemetry
import app.routes.route as routes
import app.routes.weather as weather
import app.routes.notification as notifications
import app.routes.auth as auth
import app.routes.user as users
import app.routes.dashboard as dashboard
import app.routes.chat as chat
import app.routes.ml_prediction as ml_prediction
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(locations.router)
app.include_router(hazards.router)
app.include_router(prediction.router)
app.include_router(vehicles.router)
app.include_router(telemetry.router)
app.include_router(routes.router)
app.include_router(weather.router)
app.include_router(notifications.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(ml_prediction.router)
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Hazard backend is running"}


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "error",
            "database": str(e)
        }