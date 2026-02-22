# Anti-Spoofing Detection Platform

This project is a Dual-Model Anti-Spoofing Detection Platform, designed to determine whether a given face image is real or spoofed (e.g., printed photo, screen replay). It uses a powerful cross-model consensus engine combining a Vision Transformer (ViT) via Hugging Face and a YOLO-based detection model via Roboflow.

## Project Structure

- `backend/`: FastAPI Python server handling the dual-model inference and consensus logic.
- `frontend/`: React + Vite single-page application providing a modern, drag-and-drop interface for users.
- `test/`: Contains sample live and spoof images for testing the platform.

## How It Works

The system implements a Hierarchical Consensus Logic with Roboflow as the primary gatekeeper:
1. **Roboflow (YOLO)**: Checks if a face is even detected. If no face is detected, the result is inconclusive.
2. **Hugging Face (ViT)**: Acts as the secondary model.
3. **Consensus Engine**: 
   - If Roboflow says SPOOF, it's considered a spoof (using highest confidence if both agree).
   - If Roboflow says REAL, it checks with HF. If HF disagrees, the verdict remains REAL but takes a 25% confidence penalty.

## Prerequisites

- Node.js (v16+)
- Python (3.9+)
- A Hugging Face account / access to the internet to download the models.
- A Roboflow API Key and Model ID.

## Setup Instructions

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment variables:
   Ensure you have a `.env` file in the `backend` directory containing your Roboflow keys:
   ```env
   ROBOFLOW_API_KEY=your_api_key_here
   ROBOFLOW_MODEL_ID=your_model_id_here
   ```
5. Run the server:
   ```bash
   python main.py
   # The server will start on http://localhost:8000
   ```

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # The app will typically be available on http://localhost:5173
   ```

## Usage

1. Make sure both the backend and frontend servers are running.
2. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
3. Drag and drop a face image (or click to upload) into the designated area.
4. Wait for the dual-inference engine to process the image and display the final verdict (REAL, SPOOF, or INCONCLUSIVE) along with confidence scores from both models.
