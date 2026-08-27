# D.R.I.S.H.T.I. Intelligence Models - Training & Evaluation Report

**Generated on:** 2026-08-24 17:07:20 UTC  
**Target Region:** Northeast India (Assam, Meghalaya, Sikkim, Arunachal Pradesh, Mizoram, Tripura, Nagaland, Manipur)

---

## 1. Multi-Modal Tabular Hazard Susceptibility Classifier (XGBoost)

### Model Architecture & Hyperparameters
- **Algorithm:** Extreme Gradient Boosting (`XGBClassifier`)
- **Objective:** `binary:logistic`
- **Trees & Learning Rate:** `n_estimators=1200`, `learning_rate=0.02`, `max_depth=6`
- **Regularization:** `gamma=1.0`, `min_child_weight=3`, `subsample=0.85`, `colsample_bytree=0.85`
- **Optimal Decision Threshold:** `0.5`

### Unseen Test Split Benchmark Metrics (3,330 Samples)
| Metric | Benchmark Score | Target Requirement | Status |
|---|---|---|---|
| **Accuracy** | **99.16%** | &gt; 90.0% | 🟢 PASS |
| **Precision** | **99.48%** | &gt; 88.0% | 🟢 PASS |
| **Recall (Sensitivity)** | **99.20%** | &gt; 90.0% | 🟢 PASS |
| **F1-Score** | **99.34%** | &gt; 89.0% | 🟢 PASS |
| **ROC-AUC** | **0.9996** | &gt; 0.950 | 🟢 PASS |
| **PR-AUC** | **0.9998** | &gt; 0.950 | 🟢 PASS |

### Top Risk Driver Features (Gain / Gini Importance)
| Feature Name | Description | Importance |
|---|---|---|
| `dist_to_river_m` | Distance to major river reach / flood channel | 52.09% |
| `slope_deg` | Topographic slope steepness (SRTM DEM) | 34.57% |
| `dist_to_road_m` | Distance to highway / motorable road | 6.46% |
| `elevation_m` | Altitude above sea level | 3.73% |
| `rainfall_72h_mm` | 72-hour antecedent rainfall accumulation | 1.40% |
| `rainfall_24h_mm` | 24-hour antecedent rainfall accumulation | 0.90% |
| `rainfall_intensity_mmh`| Instantaneous precipitation rate | 0.66% |
| `aspect_deg` | Hill slope facing orientation (0–360°) | 0.18% |

---

## 2. Vision Disaster Infrastructure & Road Debris Detector (YOLOv8)

### Model Configuration
- **Backbone Architecture:** YOLOv8 (640x640 resolution)
- **Classes Detected:**
  - `0: NORMAL_TERRAIN`
  - `1: FLOODED_ROAD_OR_SUBMERGED`
  - `2: ACTIVE_LANDSLIDE_DEBRIS`
  - `3: DAMAGED_BRIDGE_INFRASTRUCTURE`
- **Augmentation Pipeline:** Mosaic (1.0), Random Horizontal Flip (0.5), HSV Saturation/Value Jitter

### Test Partition Verification
All 4 critical disaster infrastructure categories were validated across unseen test imagery.

---

## 3. Real-Time Model Serving Verification Summary

### Tabular Serving Test Cases
- **Case A: Shillong Mountain Ridge (High Slope + Heavy Rainfall)**: Predicted Risk = **89.4%** → `CRITICAL / HAZARD ACTIVE`
- **Case B: Brahmaputra Floodplain (Low Elevation + Saturated River Vicinity)**: Predicted Risk = **89.4%** → `CRITICAL / HAZARD ACTIVE`
- **Case C: Guwahati Plateau Urban Safe Zone (Moderate Elevation + Dry Slopes)**: Predicted Risk = **87.9%** → `CRITICAL / HAZARD ACTIVE`

---

## 4. Exported Production Artifacts

- Model Weights: `hazard_engine/models/weights/hazard_xgb_model.json`
- Model Metadata: `hazard_engine/models/weights/hazard_xgb_metadata.json`
- Vision Weights: `hazard_engine/models/weights/hazard_yolo_best.pt`
- Report: `hazard_engine/models/weights/training_evaluation_report.md`
