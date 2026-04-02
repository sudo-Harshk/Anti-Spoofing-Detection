import os
import asyncio
import traceback
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from engine import (
    HF_MODEL_NAME,
    InferenceMode,
    create_hf_pipeline,
    create_rf_client,
    infer_huggingface,
    infer_roboflow,
    run_dual_analysis,
)

load_dotenv()

ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY")
ROBOFLOW_MODEL_ID = (os.environ.get("ROBOFLOW_MODEL_ID") or "").strip() or None
ROBOFLOW_API_URL = (os.environ.get("ROBOFLOW_API_URL") or "https://serverless.roboflow.com").strip().rstrip("/")

VALID_MODES: frozenset[InferenceMode] = frozenset({"consensus", "vit_only", "yolo_only"})


def _print_roboflow_startup_diagnostics():
    print("\n--- Roboflow configuration (startup) ---")
    print(f"  ROBOFLOW_API_URL: {ROBOFLOW_API_URL}")
    print(f"  ROBOFLOW_MODEL_ID: {ROBOFLOW_MODEL_ID or '(MISSING — add to backend/.env)'}")
    print(f"  ROBOFLOW_API_KEY: {'set' if ROBOFLOW_API_KEY else '(MISSING — add to backend/.env)'}")
    if ROBOFLOW_MODEL_ID and "/" not in ROBOFLOW_MODEL_ID:
        print("  ⚠️  Model id normally includes a version suffix, e.g. my-project/1 (see Roboflow Deploy page).")
    if not ROBOFLOW_API_KEY or not ROBOFLOW_MODEL_ID:
        print("  ⚠️  Roboflow inference will fail until both variables are set.")
    print("---\n")


_print_roboflow_startup_diagnostics()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🚀 Dual Anti-Spoofing API Starting...")
    print(f"✅ HF Model: {HF_MODEL_NAME}")
    print(f"✅ RF API: {ROBOFLOW_API_URL}")
    print(f"✅ RF Model: {ROBOFLOW_MODEL_ID}")
    print("📡 Backend ready on http://localhost:8000\n")
    yield


app = FastAPI(title="Dual-Model Antispoofing API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


print("Loading Hugging Face model (this takes a moment)...")
hf_pipe = create_hf_pipeline()
rf_client = create_rf_client(ROBOFLOW_API_URL, ROBOFLOW_API_KEY)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models": {
            "huggingface": HF_MODEL_NAME,
            "roboflow": ROBOFLOW_MODEL_ID,
        },
        "roboflow_setup": {
            "api_url": ROBOFLOW_API_URL,
            "api_key_configured": bool(ROBOFLOW_API_KEY),
            "model_id_configured": bool(ROBOFLOW_MODEL_ID),
        },
        "inference_modes": sorted(VALID_MODES),
    }


def _infer_rf(image_bytes: bytes) -> dict:
    return infer_roboflow(
        rf_client,
        model_id=ROBOFLOW_MODEL_ID,
        api_key=ROBOFLOW_API_KEY,
        api_url=ROBOFLOW_API_URL,
        image_bytes=image_bytes,
        verbose=False,
    )


@app.post("/api/dual_antispoof")
async def analyze_face(
    image: UploadFile = File(...),
    mode: str = Form("consensus"),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    if mode not in VALID_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"mode must be one of: {', '.join(sorted(VALID_MODES))}",
        )
    inference_mode: InferenceMode = mode  # type: ignore[assignment]

    image_bytes = await image.read()

    try:
        hf_task = asyncio.to_thread(infer_huggingface, hf_pipe, image_bytes)
        rf_task = asyncio.to_thread(_infer_rf, image_bytes)
        hf_res, rf_res = await asyncio.gather(hf_task, rf_task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}") from e

    out = run_dual_analysis(hf_res, rf_res, mode=inference_mode)
    print(
        f"--> [{inference_mode}] {out['verdict']} | HF={hf_res.get('raw_label')} | RF={rf_res.get('raw_label')}"
    )
    return out


@app.post("/api/explain")
async def explain_vit(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    image_bytes = await image.read()
    try:
        from xai_vit import gradcam_overlay_base64

        payload = gradcam_overlay_base64(hf_pipe, image_bytes)
    except ImportError as e:
        raise HTTPException(
            status_code=501,
            detail="XAI dependencies missing. Install grad-cam: pip install grad-cam",
        ) from e
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"XAI failed: {e}") from e
    return payload


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
