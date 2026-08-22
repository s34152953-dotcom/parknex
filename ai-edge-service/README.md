# ParkNex AI Edge Service (ANPR & Camera Vision)

This microservice runs locally on the mall operator's edge hardware / laptop to perform real-time License Plate Recognition (ANPR) and camera occupancy tracking without incurring serverless latency or compute limits.

## Technology Stack
- **Framework**: FastAPI / Uvicorn (Python 3.10+)
- **Computer Vision**: OpenCV (`opencv-python-headless`)
- **Neural OCR Engine**: PaddleDetection PP-Vehicle & PaddleOCR (Apache-2.0 licensed, free & open-source)
- **Security**: HMAC-SHA256 Webhook signature to Convex HTTP endpoints

## Setup & Local Run

```bash
cd ai-edge-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Service starts at `http://localhost:8000`.

## Endpoints

- `GET /health`: Health status and OCR engine readiness.
- `POST /detect-plate`: Accepts image frame (multipart or base64), normalizes vehicle license plate, and posts HMAC signed webhook to Convex.
