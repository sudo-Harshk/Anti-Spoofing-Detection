#!/usr/bin/env python3
"""
Research benchmark: APCER, BPCER, ACER on folder-organized datasets.

Layout:
  --live-dir   images of bonafide (live) faces
  --spoof-dir  images of presentation attacks (spoof)

Metrics use only samples where the system outputs REAL or SPOOF (binary decision).
INCONCLUSIVE and ERROR are reported separately and excluded from APCER/BPCER denominators.
"""
from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

IMAGE_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"})


def _list_images(d: Path) -> list[Path]:
    if not d.is_dir():
        return []
    return sorted(p for p in d.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS)


def main() -> int:
    parser = argparse.ArgumentParser(description="Face anti-spoofing benchmark (APCER / BPCER / ACER)")
    parser.add_argument("--live-dir", type=Path, required=True, help="Bonafide (live) images folder")
    parser.add_argument("--spoof-dir", type=Path, required=True, help="Spoof / attack images folder")
    parser.add_argument(
        "--mode",
        choices=("consensus", "vit_only", "yolo_only"),
        default="consensus",
        help="Inference mode (ablation study)",
    )
    parser.add_argument("--out-csv", type=Path, default=None, help="Write per-image rows to CSV")
    parser.add_argument("--quiet", action="store_true", help="Less console output")
    args = parser.parse_args()

    from dotenv import load_dotenv

    load_dotenv(BACKEND_ROOT / ".env")

    from engine import (
        compute_acer_metrics,
        create_hf_pipeline,
        create_rf_client,
        infer_huggingface,
        infer_roboflow,
        prediction_is_live,
        run_dual_analysis,
    )

    live_dir = args.live_dir.resolve()
    spoof_dir = args.spoof_dir.resolve()
    live_files = _list_images(live_dir)
    spoof_files = _list_images(spoof_dir)

    if not live_files:
        print(f"No images found in live dir: {live_dir}", file=sys.stderr)
        return 1
    if not spoof_files:
        print(f"No images found in spoof dir: {spoof_dir}", file=sys.stderr)
        return 1

    robo_key = os.environ.get("ROBOFLOW_API_KEY")
    robo_id = (os.environ.get("ROBOFLOW_MODEL_ID") or "").strip() or None
    robo_url = (os.environ.get("ROBOFLOW_API_URL") or "https://serverless.roboflow.com").strip().rstrip("/")

    if not args.quiet:
        print("Loading Hugging Face ViT...")
    hf_pipe = create_hf_pipeline()
    rf_client = create_rf_client(robo_url, robo_key)

    rows: list[dict] = []
    # Counters for decided predictions only
    n_live_decided = n_spoof_decided = 0
    false_spoof_on_live = false_live_on_spoof = 0
    live_skip = spoof_skip = 0

    jobs: list[tuple[Path, str]] = [(p, "live") for p in live_files] + [(p, "spoof") for p in spoof_files]

    try:
        from tqdm import tqdm
    except ImportError:
        tqdm = None  # type: ignore[misc, assignment]

    iterator = jobs
    if tqdm and not args.quiet:
        iterator = tqdm(jobs, desc=f"Benchmark ({args.mode})")

    for path, gt_label in iterator:
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
        out = run_dual_analysis(hf_res, rf_res, mode=args.mode)  # type: ignore[arg-type]
        verdict = out["verdict"]
        pred = prediction_is_live(verdict)

        row = {
            "path": str(path),
            "ground_truth": gt_label,
            "verdict": verdict,
            "confidence": out["confidence"],
            "hf_label": hf_res.get("raw_label"),
            "hf_conf": hf_res.get("confidence"),
            "rf_label": rf_res.get("raw_label"),
            "rf_conf": rf_res.get("confidence"),
        }
        rows.append(row)

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

    print("\n=== Benchmark summary ===")
    print(f"Mode:              {args.mode}")
    print(f"Live images:       {len(live_files)} (decided: {n_live_decided}, inconclusive/error: {live_skip})")
    print(f"Spoof images:      {len(spoof_files)} (decided: {n_spoof_decided}, inconclusive/error: {spoof_skip})")
    print(f"APCER (on spoof†): {metrics['APCER']}")
    print(f"BPCER (on live†):  {metrics['BPCER']}")
    print(f"ACER:              {metrics['ACER']}")
    print("† Denominator = samples with verdict REAL or SPOOF only.\n")

    if args.out_csv:
        args.out_csv.parent.mkdir(parents=True, exist_ok=True)
        with args.out_csv.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else [])
            w.writeheader()
            w.writerows(rows)
        print(f"Wrote per-image CSV: {args.out_csv}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
