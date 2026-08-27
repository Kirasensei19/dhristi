"""
train_vision_yolo.py
Module 2: Vision Disaster Infrastructure & Road Debris Detector (YOLOv8)
Optimized for high accuracy and fast CPU/GPU fine-tuning for D.R.I.S.H.T.I.
"""

import os
import sys
import shutil
import yaml
from pathlib import Path
import torch

def configure_cpu_acceleration():
    threads = max(4, os.cpu_count() or 8)
    torch.set_num_threads(threads)
    if hasattr(torch, "set_num_interop_threads"):
        try:
            torch.set_num_interop_threads(2)
        except Exception:
            pass
    print(f"[*] Configured PyTorch CPU SIMD parallel execution with {threads} threads.")

def locate_vision_data() -> Path:
    candidates = [
        Path("d:/Dristhi/drishti_data/05_vision_hazard_detection_yolo"),
        Path(__file__).resolve().parent.parent / "drishti_data" / "05_vision_hazard_detection_yolo",
        Path("d:/Dristhi/CLEAN_READY_DATA/05_vision_hazard_detection_yolo"),
        Path("D:/SIH DATA/CLEAN_READY_DATA/05_vision_hazard_detection_yolo")
    ]
    for c in candidates:
        if c.exists() and (c / "data.yaml").exists():
            return c
    raise FileNotFoundError("Could not find 05_vision_hazard_detection_yolo directory!")

def prepare_yaml(data_dir: Path) -> str:
    """Ensures absolute normalized paths in data.yaml for Ultralytics."""
    with open(data_dir / "data.yaml", "r") as f:
        cfg = yaml.safe_load(f)

    cfg["path"] = str(data_dir.resolve()).replace("\\", "/")
    cfg["train"] = "train/images"
    cfg["val"] = "val/images"
    cfg["test"] = "test/images"

    resolved_yaml_path = data_dir / "data_resolved.yaml"
    with open(resolved_yaml_path, "w") as f:
        yaml.dump(cfg, f, default_flow_style=False)

    print(f"[*] Prepared resolved YAML configuration: {resolved_yaml_path}")
    return str(resolved_yaml_path)

def main():
    print("=" * 85)
    print("D.R.I.S.H.T.I. - MODULE 2: VISION DISASTER & ROAD DEBRIS DETECTOR (YOLOV8)")
    print("=" * 85)

    configure_cpu_acceleration()

    from ultralytics import YOLO

    vision_dir = locate_vision_data()
    print(f"[*] Vision Dataset Root: {vision_dir}")
    yaml_file = prepare_yaml(vision_dir)

    device = "0" if torch.cuda.is_available() else "cpu"
    print(f"[*] Compute Target Device: {device} (CUDA: {torch.cuda.is_available()})")

    # Load baseline YOLOv8 nano model
    print("[*] Initializing YOLOv8 pretrained backbone (yolov8n.pt)...")
    model = YOLO("yolov8n.pt")

    # Ultra-optimized fine-tuning setup
    epochs = 4
    batch_size = 32
    imgsz = 480

    print(f"[*] Launching Optimized Fine-Tuning: Epochs={epochs}, BatchSize={batch_size}, ImageSize={imgsz}, Cache=RAM, Optimizer=AdamW...")

    results = model.train(
        data=yaml_file,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        workers=0,
        cache="ram",
        device=device,
        optimizer="AdamW",
        lr0=0.002,
        lrf=0.01,
        mosaic=1.0,
        fliplr=0.5,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        project="runs/detect",
        name="drishti_hazard_yolo",
        exist_ok=True,
        verbose=True
    )

    print("\n[✓] Training completed! Evaluating on Test Partition...")
    # Evaluate on test set
    val_results = model.val(data=yaml_file, split="test", imgsz=imgsz)

    print("\n" + "=" * 50)
    print("VISION TEST EVALUATION METRICS:")
    print("=" * 50)
    try:
        mp = val_results.box.mp
        mr = val_results.box.mr
        map50 = val_results.box.map50
        map50_95 = val_results.box.map
        print(f"  Mean Precision:    {mp * 100:.2f}%")
        print(f"  Mean Recall:       {mr * 100:.2f}%")
        print(f"  mAP @ 0.50:        {map50 * 100:.2f}%")
        print(f"  mAP @ 0.50:0.95:   {map50_95 * 100:.2f}%")
    except Exception as e:
        print(f"  Metrics extracted: {val_results}")

    # Export best model
    weights_dir = Path(__file__).resolve().parent / "weights"
    weights_dir.mkdir(parents=True, exist_ok=True)
    target_weights = weights_dir / "hazard_yolo_best.pt"

    best_pt = Path("runs/detect/drishti_hazard_yolo/weights/best.pt")
    if not best_pt.exists():
        best_pt = Path("runs/detect/train/weights/best.pt")
    if not best_pt.exists():
        model.save(str(target_weights))
    else:
        shutil.copy(best_pt, target_weights)

    print(f"\n[✓] Exported Best YOLOv8 Model -> {target_weights}")
    print("=" * 85)

if __name__ == "__main__":
    main()
