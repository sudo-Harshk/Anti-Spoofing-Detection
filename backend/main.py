import os
import asyncio
import io
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
from inference_sdk import InferenceHTTPClient
from dotenv import load_dotenv

load_dotenv()

ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY")
ROBOFLOW_MODEL_ID = os.environ.get("ROBOFLOW_MODEL_ID")

# --- Startup Logging (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🚀 Dual Anti-Spoofing API Starting...")
    print(f"✅ HF Model: prithivMLmods/Deep-Fake-Detector-v2-Model")
    print(f"✅ RF Model: {ROBOFLOW_MODEL_ID}")
    print("📡 Backend ready on http://localhost:8000\n")
    yield

app = FastAPI(title="Dual-Model Antispoofing API", lifespan=lifespan)

# Allow your Vite frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health Endpoint ---
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models": {
            "huggingface": "prithivMLmods/Deep-Fake-Detector-v2-Model",
            "roboflow": ROBOFLOW_MODEL_ID
        }
    }

# --- 1. Initialize Models ---
print("Loading Hugging Face model (this takes a moment)...")
hf_pipe = pipeline("image-classification", model="prithivMLmods/Deep-Fake-Detector-v2-Model")

rf_client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

# --- 2. Inference Wrappers ---
def infer_huggingface(image_bytes: bytes):
    try:
        print("--> [HF] Starting Hugging Face inference...")
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        result = hf_pipe(image)
        
        # Grab the top prediction
        top_pred = result[0]
        
        # Force the label to lowercase just to be safe, then do a direct match
        label = top_pred['label'].lower()
        
        # The ultimate, foolproof check based on your exact id2label mapping
        is_real = (label == "real")
        
        print(f"--> [HF] Success! Verdict: {label} (Conf: {top_pred['score']:.2f})")
        return {"is_real": is_real, "confidence": top_pred['score'], "raw_label": label, "status": "ok"}
        
    except Exception as e:
        print(f"--> [HF] ❌ ERROR CAUGHT: {str(e)}")
        return {"is_real": False, "confidence": 0.0, "raw_label": "error", "status": f"error: {str(e)}"}

def infer_roboflow(image_bytes: bytes):
    try:
        print("--> [RF] Starting Roboflow inference...")
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        result = rf_client.infer(image, model_id=ROBOFLOW_MODEL_ID)
        
        if "predictions" in result and len(result["predictions"]) > 0:
            top_pred = result['predictions'][0] if isinstance(result['predictions'], list) else result['predictions']
            label = top_pred.get('class', top_pred.get('top', '')).lower()
            confidence = top_pred.get('confidence', 0.0)
            
            is_real = "real" in label
            print(f"--> [RF] Success! Verdict: {label} (Conf: {confidence:.2f})")
            return {"is_real": is_real, "confidence": confidence, "raw_label": label, "status": "ok"}
        else:
            print("--> [RF] ⚠️ No face/object detected by Roboflow!")
            return {"is_real": False, "confidence": 0.0, "raw_label": "no_detection", "status": "no objects found"}
            
    except Exception as e:
        print(f"--> [RF] ❌ ERROR CAUGHT: {str(e)}")
        return {"is_real": False, "confidence": 0.0, "raw_label": "error", "status": f"error: {str(e)}"}

# --- 3. Core Consensus Endpoint ---
@app.post("/api/dual_antispoof")
async def analyze_face(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await image.read()

    try:
        hf_task = asyncio.to_thread(infer_huggingface, image_bytes)
        rf_task = asyncio.to_thread(infer_roboflow, image_bytes)
        
        hf_res, rf_res = await asyncio.gather(hf_task, rf_task)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    # --- 4. Hierarchical Consensus Logic (Roboflow Primary) ---
    
    # 1. Gatekeeper: If Roboflow can't even find a face, stop guessing.
    if rf_res["raw_label"] == "no_detection":
        verdict = "INCONCLUSIVE"
        confidence = 0.0
        
    # 2. Priority 1: Roboflow says it's a SPOOF
    elif not rf_res["is_real"]:
        verdict = "SPOOF"
        # If HF agrees, use the highest confidence. Otherwise, stick to Roboflow's confidence.
        if not hf_res["is_real"]:
            confidence = max(rf_res["confidence"], hf_res["confidence"])
        else:
            confidence = rf_res["confidence"]
            
    # 3. Priority 2: Roboflow says it's REAL
    else:
        # Roboflow thinks it's real. Let's check the secondary model (HF).
        if hf_res["is_real"]:
            # Total agreement!
            verdict = "REAL"
            confidence = max(rf_res["confidence"], hf_res["confidence"])
        else:
            # Disagreement! Trust Roboflow, but penalize the confidence score because HF saw something weird.
            verdict = "REAL"
            confidence = rf_res["confidence"] * 0.75  # 25% risk penalty
            

    return {
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "details": {
            "huggingface": hf_res,
            "roboflow": rf_res
        }
    }

# --- Uvicorn Runner (Windows Safe) ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)