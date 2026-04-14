#!/usr/bin/env python3
"""
Generate benchmark_results.json for all 3 inference modes.

Run from the backend/ directory:
    python run_benchmark_all.py

Reads test images from:
    ../test/live/   — bonafide (live) face images
    ../test/spoof/  — presentation attack images

Saves results to:
    backend/benchmark_results.json
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

IMAGE_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"})
MODES = ("vit_only", "yolo_only", "consensus")


def _list_images(d: Path) -> list[Path]:
    if not d.is_dir():
        return []
    return sorted(p for p in d.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS)


def _run_mode(hf_pipe, rf_client, robo_id, robo_key, robo_url, live_files, spoof_files, mode):
    from engine import (
        compute_acer_metrics,
        infer_huggingface,
        infer_roboflow,
        prediction_is_live,
        run_dual_analysis,
    )

    n_live_decided = n_spoof_decided = 0
    false_spoof_on_live = false_live_on_spoof = 0
    live_skip = spoof_skip = 0
    per_image = []

    jobs = [(p, "live") for p in live_files] + [(p, "spoof") for p in spoof_files]

    for path, gt_label in jobs:
        data = path.read_bytes()
        hf_res = infer_huggingface(hf_pipe, data)
        rf_res = infer_roboflow(
            rf_client,
            model_id=robo_id,
            api_key=robo_key,
            api_url=robo_url,
            image_bytes=data,
            verbose=False,
        )
        out = run_dual_analysis(hf_res, rf_res, mode=mode)
        verdict = out["verdict"]
        pred = prediction_is_live(verdict)

        per_image.append({
            "file": path.name,
            "ground_truth": gt_label,
            "verdict": verdict,
            "confidence": out["confidence"],
            "correct": (pred is True and gt_label == "live") or (pred is False and gt_label == "spoof"),
        })

        if pred is None:
            if gt_label == "live":
                live_skip += 1
            else:
                spoof_skip += 1
            continue

        if gt_label == "live":
            n_live_decided += 1
            if not pred:
                false_spoof_on_live += 1
        else:
            n_spoof_decided += 1
            if pred:
                false_live_on_spoof += 1

    metrics = compute_acer_metrics(
        n_live=n_live_decided,
        n_spoof=n_spoof_decided,
        false_live_on_spoof=false_live_on_spoof,
        false_spoof_on_live=false_spoof_on_live,
    )

    total_decided = n_live_decided + n_spoof_decided
    correct = sum(1 for r in per_image if r["correct"] and r["verdict"] in ("REAL", "SPOOF"))
    accuracy = round(correct / total_decided, 4) if total_decided else 0.0

    return {
        **metrics,
        "accuracy": accuracy,
        "total_images": len(jobs),
        "decided": total_decided,
        "skipped": live_skip + spoof_skip,
        "per_image": per_image,
    }


def main() -> int:
    from dotenv import load_dotenv
    load_dotenv(BACKEND_ROOT / ".env")

    from engine import create_hf_pipeline, create_rf_client

    repo_root = BACKEND_ROOT.parent
    live_dir = repo_root / "test" / "live"
    spoof_dir = repo_root / "test" / "spoof"

    live_files = _list_images(live_dir)
    spoof_files = _list_images(spoof_dir)

    if not live_files:
        print(f"ERROR: No images in {live_dir}", file=sys.stderr)
        return 1
    if not spoof_files:
        print(f"ERROR: No images in {spoof_dir}", file=sys.stderr)
        return 1

    print(f"Dataset: {len(live_files)} live, {len(spoof_files)} spoof")

    robo_key = os.environ.get("ROBOFLOW_API_KEY")
    robo_id = (os.environ.get("ROBOFLOW_MODEL_ID") or "").strip() or None
    robo_url = (os.environ.get("ROBOFLOW_API_URL") or "https://serverless.roboflow.com").strip().rstrip("/")

    print("Loading Hugging Face ViT model...")
    hf_pipe = create_hf_pipeline()
    rf_client = create_rf_client(robo_url, robo_key)

    results: dict = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "dataset": {
            "live_dir": str(live_dir),
            "spoof_dir": str(spoof_dir),
            "n_live": len(live_files),
            "n_spoof": len(spoof_files),
        },
        "modes": {},
    }

    for mode in MODES:
        print(f"\nRunning mode: {mode} ...")
        mode_result = _run_mode(hf_pipe, rf_client, robo_id, robo_key, robo_url, live_files, spoof_files, mode)
        results["modes"][mode] = mode_result
        print(f"  APCER={mode_result['APCER']:.4f}  BPCER={mode_result['BPCER']:.4f}  ACER={mode_result['ACER']:.4f}  Accuracy={mode_result['accuracy']:.4f}")

    out_path = BACKEND_ROOT / "benchmark_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\nSaved to: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
