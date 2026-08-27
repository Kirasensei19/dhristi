import os
import xgboost as xgb
from ultralytics import YOLO


# Get the project root directory
BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../../"
    )
)


# Path to the folder containing trained models
MODEL_DIR = os.path.join(
    BASE_DIR,
    "drishti_models",
    "weights"
)


# YOLO model path
YOLO_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "hazard_yolo_best.pt"
)


# XGBoost model path
XGB_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "hazard_xgb_model.json"
)


# ==============================
# LOAD XGBOOST MODEL
# ==============================

print("Loading XGBoost model...")
print(f"Model path: {XGB_MODEL_PATH}")

xgb_model = xgb.XGBClassifier()

xgb_model.load_model(XGB_MODEL_PATH)

print("XGBoost model loaded successfully!")


# ==============================
# XGBOOST PREDICTION
# ==============================

def predict_hazard_susceptibility(features: dict):

    # Exact feature order used during model training
    feature_order = [
        "elevation_m",
        "slope_deg",
        "aspect_deg",
        "dist_to_river_m",
        "dist_to_road_m",
        "rainfall_72h_mm",
        "rainfall_24h_mm",
        "rainfall_intensity_mmh"
    ]

    # Arrange features in the exact order
    input_data = [[
        features[feature]
        for feature in feature_order
    ]]

    # Get probability of hazard
    probability = float(
        xgb_model.predict_proba(input_data)[0][1]
    )

    # Binary prediction
    prediction = int(
        probability >= 0.5
    )

    # Determine risk level
    if probability >= 0.7:
        risk_level = "HIGH"

    elif probability >= 0.4:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "hazard_probability": round(probability, 4),
        "prediction": prediction,
        "risk_level": risk_level
    }


# ==============================
# LOAD YOLO MODEL
# ==============================

print("Loading YOLO model...")

yolo_model = YOLO(
    YOLO_MODEL_PATH
)

print("YOLO model loaded successfully!")
print("YOLO classes:", yolo_model.names)


# ==============================
# YOLO IMAGE ANALYSIS
# ==============================

def analyze_hazard_image(image_path: str):

    # Run YOLO inference
    results = yolo_model(
        image_path
    )

    detections = []

    # Process prediction results
    for result in results:

        for box in result.boxes:

            # Get predicted class ID
            class_id = int(
                box.cls[0]
            )

            # Get confidence score
            confidence = float(
                box.conf[0]
            )

            # Convert class ID to hazard name
            hazard_type = result.names[
                class_id
            ]

            # Get bounding box coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "hazard_type": hazard_type,
                "confidence": round(confidence, 4),
                "bounding_box": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                }
            })

    return {
        "total_detected": len(detections),
        "detections": detections
    }