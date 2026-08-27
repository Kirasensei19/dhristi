from typing import Dict, Any, List, Optional
import math

# Historical regional disaster baselines (Northeast India corridors)
HISTORICAL_WEATHER_BASELINES = {
    "SHILLONG_PASS": {"max_rainfall_24h_mm": 50.0, "max_wind_kmh": 40.0, "landslide_slope_deg": 25.0},
    "BRAHMAPUTRA_VALLEY": {"max_rainfall_24h_mm": 60.0, "max_wind_kmh": 45.0, "landslide_slope_deg": 10.0},
    "DEFAULT": {"max_rainfall_24h_mm": 45.0, "max_wind_kmh": 35.0, "landslide_slope_deg": 20.0}
}


def verify_hazard_with_ai(
    hazard_type: str,
    severity: str,
    description: str,
    live_weather: Dict[str, Any],
    location_info: Dict[str, Any],
    vision_detections: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Autonomous AI Cross-Verification Engine.
    Cross-checks reported fault/disaster against live weather sensors, historical rainfall baselines,
    wind speeds, terrain slope, and vision AI detections to decide validity.
    """
    hazard_type_upper = (hazard_type or "").upper()
    location_name = location_info.get("name", "DEFAULT").upper()
    
    # Extract live sensor measurements
    rainfall_24h = float(live_weather.get("rainfall_24h_mm", 0.0))
    rainfall_72h = float(live_weather.get("rainfall_72h_mm", 0.0))
    rainfall_intensity = float(live_weather.get("rainfall_intensity_mmh", 0.0))
    wind_speed = float(live_weather.get("wind_speed_kmh", 0.0))
    slope_deg = float(location_info.get("slope_deg", 15.0))
    
    # Get historical threshold baseline
    baseline = HISTORICAL_WEATHER_BASELINES.get(
        "SHILLONG_PASS" if "SHILLONG" in location_name or "NH-6" in location_name else "DEFAULT"
    )
    
    # Multi-Factor Cross-Validation Logic
    cross_validation_factors = []
    validation_score = 0.5  # Base neutral score
    
    # 1. Historical Rainfall Threshold Cross-Check
    if rainfall_24h >= baseline["max_rainfall_24h_mm"] or rainfall_72h >= 100.0:
        validation_score += 0.25
        cross_validation_factors.append({
            "factor": "HISTORICAL_RAINFALL_BASELINE",
            "matched": True,
            "detail": f"24h Rain ({rainfall_24h}mm) & 72h Rain ({rainfall_72h}mm) exceed historical disaster threshold ({baseline['max_rainfall_24h_mm']}mm)."
        })
    else:
        cross_validation_factors.append({
            "factor": "HISTORICAL_RAINFALL_BASELINE",
            "matched": False,
            "detail": f"Rainfall ({rainfall_24h}mm) is below historical trigger threshold ({baseline['max_rainfall_24h_mm']}mm)."
        })
        
    # 2. Wind & Structural Fault Cross-Check
    if "BRIDGE" in hazard_type_upper or "INFRASTRUCTURE" in hazard_type_upper:
        if wind_speed >= baseline["max_wind_kmh"] or rainfall_intensity >= 15.0:
            validation_score += 0.20
            cross_validation_factors.append({
                "factor": "WIND_STRUCTURAL_STRESS",
                "matched": True,
                "detail": f"Extreme wind ({wind_speed} km/h) / intense rainfall ({rainfall_intensity} mm/h) supports bridge/structural fault."
            })
        else:
            cross_validation_factors.append({
                "factor": "WIND_STRUCTURAL_STRESS",
                "matched": False,
                "detail": f"Moderate wind ({wind_speed} km/h); AI flagging for physical inspection confirmation."
            })

    # 3. Slope & Landslide Stability Cross-Check
    if "LANDSLIDE" in hazard_type_upper or "MUDFLOW" in hazard_type_upper:
        if slope_deg >= baseline["landslide_slope_deg"] and rainfall_72h >= 50.0:
            validation_score += 0.25
            cross_validation_factors.append({
                "factor": "SLOPE_STABILITY_INDEX",
                "matched": True,
                "detail": f"Steep slope ({slope_deg}°) combined with 72h saturation ({rainfall_72h}mm) confirms slope failure risk."
            })

    # 4. Vision AI Detection Matching
    if vision_detections:
        matching_classes = [d for d in vision_detections if d.get("confidence", 0) > 0.5]
        if matching_classes:
            validation_score += 0.25
            cross_validation_factors.append({
                "factor": "VISION_AI_CONFIRMATION",
                "matched": True,
                "detail": f"YOLOv8 visual model confirmed fault: {matching_classes[0]['hazard_type']} ({round(matching_classes[0]['confidence']*100, 1)}% confidence)."
            })

    # Final AI Decision Classification
    final_confidence = min(0.99, max(0.10, round(validation_score, 2)))
    
    if final_confidence >= 0.75:
        ai_decision = "AI_VERIFIED_AUTHENTIC"
        recommendation = "CONFIRMED DISASTER FAULT: Immediately activate road blockade and trigger convoy safe rerouting."
    elif final_confidence >= 0.50:
        ai_decision = "AI_PROVISIONAL_HIGH_RISK"
        recommendation = "PROVISIONAL RISKS: Cross-referenced metrics suggest elevated danger. Monitoring field telemetry."
    else:
        ai_decision = "AI_UNVERIFIED_FALSE_ALARM"
        recommendation = "UNVERIFIED REPORT: Live environmental sensors & historical baselines do not support catastrophic failure."

    return {
        "status": "AI_VERIFICATION_COMPLETE",
        "ai_decision": ai_decision,
        "confidence_score": final_confidence,
        "confidence_percentage": f"{round(final_confidence * 100, 1)}%",
        "recommendation": recommendation,
        "environmental_metrics": {
            "rainfall_24h_mm": rainfall_24h,
            "rainfall_72h_mm": rainfall_72h,
            "wind_speed_kmh": wind_speed,
            "slope_deg": slope_deg,
            "historical_baseline_mm": baseline["max_rainfall_24h_mm"]
        },
        "cross_validation_factors": cross_validation_factors
    }
