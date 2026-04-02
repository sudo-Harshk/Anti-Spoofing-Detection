# Anti-Spoofing Detection Platform

Dual-model face anti-spoofing: a **Vision Transformer (ViT)** on Hugging Face plus a **YOLO**-style detector on Roboflow, with optional **hierarchical consensus**, **ablation modes**, **Grad-CAM (XAI)** on the ViT, and a **benchmark CLI** (APCER / BPCER / ACER) for thesis-style evaluation.

## Project structure

| Path | Role |
|------|------|
| `backend/main.py` | FastAPI app: `/api/dual_antispoof`, `/api/explain`, `/health` |
| `backend/engine.py` | Shared inference, HF label mapping, consensus & ablation, metric helpers |
| `backend/benchmark.py` | CLI: APCER / BPCER / ACER on folder-organized live vs spoof sets |
| `backend/xai_vit.py` | ViT Grad-CAM → base64 PNG (used by `/api/explain`) |
| `frontend/` | React + Vite UI |
| `datasets/live/`, `datasets/spoof/` | Local folders for benchmark images (see note below) |

**Note:** This repo’s `.gitignore` may ignore common image extensions. Keep benchmark images on disk under `datasets/` locally; only placeholders like `.gitkeep` need to be committed.

## How it works

### Hierarchical consensus (`mode=consensus`)

Roboflow (YOLO) is the **primary gatekeeper**:

1. **No detection** from Roboflow → **INCONCLUSIVE**.
2. **Roboflow says spoof** → **SPOOF** (confidence combines with ViT when both agree).
3. **Roboflow says real** → ViT is consulted; if ViT also says real → **REAL**; if ViT disagrees → **REAL** with a **25% confidence penalty** on the fused score.

Roboflow API failures surface as **ERROR** (not spoof).

### Single-model modes (`vit_only`, `yolo_only`)

Same two models run on the server, but the **returned verdict** follows only the selected pipeline—useful for ablation and UI “one model at a time.”

## Prerequisites

- **Node.js** v16+
- **Python** 3.9+
- Internet (HF model download; Roboflow Serverless API)
- **Roboflow** API key and deployed model id
- Optional: **`HF_TOKEN`** for higher Hugging Face Hub rate limits (see backend logs if warned)

## Setup

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
ROBOFLOW_API_KEY=your_api_key_here
ROBOFLOW_MODEL_ID=your_model_id_here
# Optional if your Roboflow deploy page specifies another host:
# ROBOFLOW_API_URL=https://serverless.roboflow.com
```

Start the API:

```bash
python main.py
# http://localhost:8000 — check http://localhost:8000/health for roboflow_setup
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Usually http://localhost:5173
```

## Using the web UI

1. Run **backend** and **frontend** together.
2. Open the app (e.g. `http://localhost:5173`).
3. Under **Model**, choose:
   - **Hugging Face (ViT)** — shows **only** the ViT outcome (confidence, label, bar) and **ViT Grad-CAM** after upload.
   - **Roboflow (YOLO)** — shows **only** the YOLO outcome; **no** Grad-CAM call (XAI is ViT-specific).
   - **Consensus (ViT + YOLO)** — shows the **fused** verdict, then a **compact** summary row for ViT and YOLO (not two large side-by-side cards), plus **Grad-CAM**.
4. **Upload or drop** a face image. **Switching the model requires a new upload** so the request uses the selected `mode`.

Grad-CAM needs the `grad-cam` package (`requirements.txt`). If `/api/explain` fails, the UI shows the API **`detail`** message when available.

## Research benchmark (thesis metrics)

From `backend/`, with images in local folders:

```bash
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode consensus
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode vit_only
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode yolo_only --out-csv ../results_ablation.csv
```

**APCER**, **BPCER**, and **ACER** use only samples whose verdict is **REAL** or **SPOOF**. Counts of **INCONCLUSIVE** and **ERROR** are printed separately and are **not** in those denominators.

## API reference

| Method | Description |
|--------|-------------|
| `POST /api/dual_antispoof` | Multipart: `image` (file), `mode` = `consensus` \| `vit_only` \| `yolo_only`. JSON: `verdict`, `confidence`, `mode`, `details.huggingface`, `details.roboflow`. |
| `POST /api/explain` | Multipart: `image`. JSON: `overlay_base64` (PNG), `predicted_label`, etc. ViT Grad-CAM; requires `grad-cam`. |
| `GET /health` | Liveness + model ids + `roboflow_setup` + supported modes. |

## More documentation

- `plan/PROPOSED_ADDITIONS.md` — research modules (metrics, XAI, ablation) and status.
