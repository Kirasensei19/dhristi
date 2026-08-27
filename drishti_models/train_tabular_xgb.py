"""
train_tabular_xgb.py
Module 1: Multi-Modal Tabular Hazard Susceptibility Classifier (XGBoost)
Trains, evaluates, benchmarks, and exports the XGBoost model for D.R.I.S.H.T.I.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
import xgboost as xgb
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)

def locate_data_dir() -> Path:
    candidates = [
        Path("d:/Dristhi/drishti_data/04_machine_learning_hazard_data"),
        Path(__file__).resolve().parent.parent / "drishti_data" / "04_machine_learning_hazard_data",
        Path("d:/Dristhi/CLEAN_READY_DATA/04_machine_learning_hazard_data"),
        Path("D:/SIH DATA/CLEAN_READY_DATA/04_machine_learning_hazard_data")
    ]
    for c in candidates:
        if c.exists() and (c / "X_train.parquet").exists():
            return c
    raise FileNotFoundError("Could not find 04_machine_learning_hazard_data directory!")

def main():
    print("=" * 85)
    print("D.R.I.S.H.T.I. - MODULE 1: TABULAR ML HAZARD CLASSIFIER (XGBOOST)")
    print("=" * 85)

    data_dir = locate_data_dir()
    print(f"[*] Loading data from: {data_dir}")

    # Load splits
    X_train = pd.read_parquet(data_dir / "X_train.parquet")
    y_train_df = pd.read_parquet(data_dir / "y_train.parquet")

    X_val = pd.read_parquet(data_dir / "X_val.parquet")
    y_val_df = pd.read_parquet(data_dir / "y_val.parquet")

    X_test = pd.read_parquet(data_dir / "X_test.parquet")
    y_test_df = pd.read_parquet(data_dir / "y_test.parquet")

    # Extract target column (is_hazard)
    target_col = "is_hazard" if "is_hazard" in y_train_df.columns else y_train_df.columns[0]
    y_train = y_train_df[target_col].values.astype(int)
    y_val = y_val_df[target_col].values.astype(int)
    y_test = y_test_df[target_col].values.astype(int)

    # Feature subset
    feature_cols = [
        "elevation_m",
        "slope_deg",
        "aspect_deg",
        "dist_to_river_m",
        "dist_to_road_m",
        "rainfall_72h_mm",
        "rainfall_24h_mm",
        "rainfall_intensity_mmh"
    ]
    # Filter features if present, otherwise use all matching
    valid_features = [f for f in feature_cols if f in X_train.columns]
    if not valid_features:
        valid_features = list(X_train.columns)

    print(f"[*] Training Features ({len(valid_features)}): {valid_features}")
    print(f"[*] Train Shape: {X_train[valid_features].shape}, Val Shape: {X_val[valid_features].shape}, Test Shape: {X_test[valid_features].shape}")
    print(f"[*] Positive class ratio - Train: {y_train.mean():.3f}, Val: {y_val.mean():.3f}, Test: {y_test.mean():.3f}")

    # Configure XGBClassifier
    xgb_params = {
        "n_estimators": 1200,
        "learning_rate": 0.02,
        "max_depth": 6,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "gamma": 1.0,
        "min_child_weight": 3,
        "objective": "binary:logistic",
        "eval_metric": ["logloss", "auc", "error"],
        "random_state": 42,
        "n_jobs": -1,
        "tree_method": "hist",
        "early_stopping_rounds": 40
    }

    model = xgb.XGBClassifier(**xgb_params)

    print("\n[*] Training XGBoost Classifier with Early Stopping...")
    model.fit(
        X_train[valid_features],
        y_train,
        eval_set=[(X_train[valid_features], y_train), (X_val[valid_features], y_val)],
        verbose=100
    )

    best_iteration = model.best_iteration
    print(f"\n[✓] Training complete! Best Iteration: {best_iteration}")

    # Evaluate on Test Split
    print("\n[*] Evaluating on Unseen Test Split...")
    y_test_probs = model.predict_proba(X_test[valid_features])[:, 1]
    
    # Calculate optimal decision threshold by maximizing F1 on Validation set
    y_val_probs = model.predict_proba(X_val[valid_features])[:, 1]
    best_thresh = 0.5
    best_f1 = 0.0
    for thresh in np.arange(0.1, 0.9, 0.02):
        f1_val = f1_score(y_val, (y_val_probs >= thresh).astype(int), zero_division=0)
        if f1_val > best_f1:
            best_f1 = f1_val
            best_thresh = round(float(thresh), 3)

    print(f"[*] Optimal Decision Threshold (Val F1={best_f1:.4f}): {best_thresh}")

    y_test_preds = (y_test_probs >= best_thresh).astype(int)

    test_acc = accuracy_score(y_test, y_test_preds)
    test_prec = precision_score(y_test, y_test_preds)
    test_rec = recall_score(y_test, y_test_preds)
    test_f1 = f1_score(y_test, y_test_preds)
    test_roc_auc = roc_auc_score(y_test, y_test_probs)
    test_pr_auc = average_precision_score(y_test, y_test_probs)
    cm = confusion_matrix(y_test, y_test_preds).tolist()

    print("\n" + "=" * 50)
    print("TEST EVALUATION METRICS:")
    print("=" * 50)
    print(f"  Accuracy:         {test_acc * 100:.2f}%")
    print(f"  Precision:        {test_prec * 100:.2f}%")
    print(f"  Recall:           {test_rec * 100:.2f}%")
    print(f"  F1-Score:         {test_f1 * 100:.2f}%")
    print(f"  ROC-AUC:          {test_roc_auc:.4f}")
    print(f"  PR-AUC:           {test_pr_auc:.4f}")
    print(f"  Confusion Matrix: {cm} (TN, FP, FN, TP)")
    print("=" * 50)

    # Feature Importance analysis
    importances = model.feature_importances_
    feat_imp = sorted(zip(valid_features, importances), key=lambda x: x[1], reverse=True)
    print("\n[*] Feature Importance (Gini / Gain):")
    for feat, imp in feat_imp:
        print(f"  - {feat:<26}: {imp * 100:.2f}%")

    # Export Artifacts
    weights_dir = Path(__file__).resolve().parent / "weights"
    weights_dir.mkdir(parents=True, exist_ok=True)

    model_path = weights_dir / "hazard_xgb_model.json"
    meta_path = weights_dir / "hazard_xgb_metadata.json"

    # Save model in standard JSON format
    model.save_model(str(model_path))
    print(f"\n[✓] Saved XGBoost Model -> {model_path}")

    # Save detailed metadata
    metadata = {
        "model_name": "D.R.I.S.H.T.I. Multi-Modal Tabular Hazard Classifier",
        "framework": f"XGBoost {xgb.__version__}",
        "export_timestamp": datetime.now(timezone.utc).isoformat(),
        "features": valid_features,
        "optimal_threshold": best_thresh,
        "best_iteration": int(best_iteration),
        "test_metrics": {
            "accuracy": round(float(test_acc), 4),
            "precision": round(float(test_prec), 4),
            "recall": round(float(test_rec), 4),
            "f1_score": round(float(test_f1), 4),
            "roc_auc": round(float(test_roc_auc), 4),
            "pr_auc": round(float(test_pr_auc), 4),
            "confusion_matrix": cm
        },
        "feature_importances": {feat: round(float(imp), 4) for feat, imp in feat_imp}
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[✓] Saved Model Metadata -> {meta_path}")

    print("\n" + "=" * 85)
    print("[+] Tabular Model Training & Benchmarking Complete!")
    print("=" * 85)

if __name__ == "__main__":
    main()
