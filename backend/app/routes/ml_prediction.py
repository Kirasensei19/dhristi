from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
import os
import shutil
import uuid
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models as models
from app.schemas.ml_prediction import HazardPredictionRequest
from app.services.ml_service import (
    predict_hazard_susceptibility,
    analyze_hazard_image
)


router = APIRouter(
    prefix="/ml",
    tags=["ML Prediction"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================
# XGBOOST HAZARD SUSCEPTIBILITY PREDICTION
# ==========================================

@router.post("/predict-susceptibility")
def predict_susceptibility(
    data: HazardPredictionRequest,
    db: Session = Depends(get_db)
):

    # Check whether the location exists
    location = db.query(
        models.Location
    ).filter(
        models.Location.id == data.location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    # Send ONLY the 8 ML features to XGBoost
    # location_id is excluded because it was not
    # part of the model training features
    features = data.model_dump(
        exclude={"location_id"}
    )

    # Run XGBoost prediction
    result = predict_hazard_susceptibility(
        features
    )

    # Create prediction record
    new_prediction = models.Prediction(
        location_id=data.location_id,
        hazard_type="HAZARD_SUSCEPTIBILITY",
        risk_level=result["risk_level"],
        confidence=result["hazard_probability"]
    )

    # Save prediction to PostgreSQL
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return {
        "success": True,
        "data": result,
        "prediction_id": new_prediction.id,
        "location_id": data.location_id
    }


# ==========================================
# YOLO IMAGE HAZARD ANALYSIS
# ==========================================

@router.post("/analyze-image")
async def analyze_image(
    location_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Check that the location exists
    location = db.query(
        models.Location
    ).filter(
        models.Location.id == location_id
    ).first()

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    # Check that the uploaded file is an image
    if (
        not file.content_type
        or not file.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )

    # Create temporary upload folder
    upload_dir = "temp_uploads"
    os.makedirs(
        upload_dir,
        exist_ok=True
    )

    # Get file extension
    file_extension = os.path.splitext(
        file.filename
    )[1]

    # Create unique temporary filename
    temp_file_path = os.path.join(
        upload_dir,
        f"{uuid.uuid4()}{file_extension}"
    )

    try:
        # Save image temporarily
        with open(
            temp_file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # Run YOLO analysis
        result = analyze_hazard_image(
            temp_file_path
        )

        created_hazards = []

        # Process every YOLO detection
        for detection in result["detections"]:

            hazard_type = detection["hazard_type"]
            confidence = detection["confidence"]

            # Skip normal terrain
            if hazard_type == "NORMAL_TERRAIN":
                continue

            # Convert confidence into severity
            if confidence >= 0.7:
                severity = "HIGH"

            elif confidence >= 0.4:
                severity = "MEDIUM"

            else:
                severity = "LOW"

            # Create automatic hazard report
            new_hazard = models.HazardReport(
                location_id=location_id,
                hazard_type=hazard_type,
                severity=severity,
                description=(
                    f"Automatically detected by YOLO model. "
                    f"Confidence: {confidence}"
                ),
                status="active"
            )

            db.add(new_hazard)

            created_hazards.append({
                "hazard_type": hazard_type,
                "severity": severity,
                "confidence": confidence
            })

        # Save all detected hazards
        db.commit()

        return {
            "success": True,
            "filename": file.filename,
            "location_id": location_id,
            "detection_result": result,
            "hazards_created": created_hazards
        }

    finally:
        # Delete temporary image
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)