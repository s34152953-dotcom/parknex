"""
ParkNex CCTV AI Edge Service
FastAPI-based Edge Computer Vision daemon for Real-Time CCTV Ingest,
License Plate Recognition (PaddleOCR), Parking Space Occupancy Tracking,
and Cryptographically Signed Sync to Convex Backend.
"""

import os
import time
import base64
import threading
from typing import Optional, List, Dict, Any, Literal
from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from config import load_cameras_config, CONVEX_HTTP_URL, SHARED_SECRET, LPR_CONFIDENCE_THRESHOLD
from lpr import extract_plate_from_image, normalize_indian_plate
from detector import VehicleDetector
from occupancy import SpaceOccupancyTracker
from queue_manager import EventQueueManager
from cctv_streamer import CctvStreamReader

app = FastAPI(
    title="ParkNex CCTV Edge Service",
    version="2.0.0",
    description="Real-Time CCTV Stream Ingestion, ANPR, and Space Occupancy Tracking"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Edge Service State
queue_mgr = EventQueueManager(convex_url=CONVEX_HTTP_URL, secret=SHARED_SECRET)
vehicle_detector = VehicleDetector()
camera_streamers: Dict[str, CctvStreamReader] = {}
occupancy_trackers: Dict[str, SpaceOccupancyTracker] = {}
is_worker_running = True

class DetectionResponse(BaseModel):
    normalizedPlate: Optional[str] = None
    confidence: float = 0.0
    cameraId: str
    gateType: Literal["entry", "exit"]
    detectedAt: int
    rawText: Optional[str] = None
    requiresOperatorConfirmation: bool = False
    status: Literal["detected", "no_plate_detected", "error"] = "detected"

def initialize_camera_workers():
    """Initializes camera stream readers and occupancy trackers based on configuration."""
    global camera_streamers, occupancy_trackers
    configs = load_cameras_config()

    for cam in configs:
        cam_id = cam.get("cameraId")
        if not cam_id:
            continue

        # Initialize stream reader
        if cam_id not in camera_streamers:
            camera_streamers[cam_id] = CctvStreamReader(cam)

        # Initialize occupancy tracker for floor cameras with polygon definitions
        if cam.get("type") == "FLOOR" and cam.get("slotPolygons"):
            occupancy_trackers[cam_id] = SpaceOccupancyTracker(cam["slotPolygons"])

def cctv_processing_loop():
    """Continuous processing loop running ANPR and occupancy checks across active streams."""
    global is_worker_running
    last_heartbeat_time = 0

    while is_worker_running:
        now = time.time()
        configs = load_cameras_config()
        config_map = {c["cameraId"]: c for c in configs if "cameraId" in c}

        # 1. Periodic Heartbeat to Convex (every 30 seconds)
        if now - last_heartbeat_time >= 30.0:
            last_heartbeat_time = now
            for cam_id, streamer in camera_streamers.items():
                status_info = streamer.get_status()
                cfg = config_map.get(cam_id, {})
                queue_mgr.post_event_directly({
                    "cameraId": cam_id,
                    "eventType": "HEARTBEAT",
                    "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                    "floor": cfg.get("floor", "B2"),
                    "zone": cfg.get("zone", "Zone A"),
                })

        # 2. Process frames from each active camera
        for cam_id, streamer in list(camera_streamers.items()):
            frame = streamer.get_latest_frame()
            if frame is None:
                continue

            cfg = config_map.get(cam_id, {})
            cam_type = cfg.get("type", "FLOOR")

            # A. Process Floor Camera Occupancy
            if cam_type == "FLOOR" and cam_id in occupancy_trackers:
                tracker = occupancy_trackers[cam_id]
                detections = vehicle_detector.detect_vehicles(frame)
                changes = tracker.update(detections)

                for change in changes:
                    event_payload = {
                        "cameraId": cam_id,
                        "eventType": "OCCUPANCY_CHANGED",
                        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        "floor": cfg.get("floor", "B2"),
                        "zone": cfg.get("zone", "Zone A"),
                        "slotId": change["slotId"],
                        "occupancyStatus": change["status"],
                        "confidence": change["confidence"]
                    }
                    queue_mgr.post_event_directly(event_payload)

            # B. Process Entry/Exit Camera ANPR when configured
            elif cam_type in ["ENTRY", "EXIT"]:
                plate_roi = cfg.get("plateRoi")
                normalized, conf, raw = extract_plate_from_image(frame, plate_roi)

                # Only emit if plate is genuinely recognized
                if normalized and conf >= 0.50:
                    event_payload = {
                        "cameraId": cam_id,
                        "eventType": "PLATE_DETECTED",
                        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        "plateNumber": normalized,
                        "confidence": conf,
                        "floor": cfg.get("floor", "G"),
                        "zone": cfg.get("zone", "Gate A"),
                        "rawText": raw,
                        "requiresConfirmation": conf < LPR_CONFIDENCE_THRESHOLD
                    }
                    queue_mgr.post_event_directly(event_payload)

        time.sleep(0.1)

@app.on_event("startup")
def startup_event():
    initialize_camera_workers()
    worker_thread = threading.Thread(target=cctv_processing_loop, daemon=True)
    worker_thread.start()
    print("[ParkNex CCTV] Edge Service and CCTV processing workers started.")

@app.get("/health")
def health_check():
    stats = queue_mgr.get_queue_stats()
    return {
        "status": "online",
        "service": "ParkNex CCTV Edge AI Daemon",
        "activeStreams": len(camera_streamers),
        "queue": stats,
        "timestamp": int(time.time() * 1000)
    }

@app.get("/cameras")
def get_cameras_status():
    """Returns real-time connection status and frame telemetry for all configured cameras."""
    results = []
    configs = load_cameras_config()
    config_map = {c["cameraId"]: c for c in configs if "cameraId" in c}

    if not configs:
        return {"cameras": [], "configured": False, "message": "Camera not configured."}

    for cam in configs:
        cam_id = cam.get("cameraId")
        if cam_id in camera_streamers:
            results.append(camera_streamers[cam_id].get_status())
        else:
            results.append({
                "cameraId": cam_id,
                "name": cam.get("name", cam_id),
                "status": "NOT_CONFIGURED",
                "fps": 0.0,
                "type": cam.get("type", "FLOOR"),
                "floor": cam.get("floor", "B2"),
                "zone": cam.get("zone", "Zone A"),
            })

    return {"cameras": results, "configured": len(results) > 0}

@app.post("/detect-plate", response_model=DetectionResponse)
async def detect_plate(
    image: Optional[UploadFile] = File(None),
    base64Image: Optional[str] = Form(None),
    cameraId: str = Form("cam-entry-01"),
    gateType: Literal["entry", "exit"] = Form("entry"),
):
    """Direct plate extraction endpoint for operator kiosk upload or camera snapshot."""
    detected_at = int(time.time() * 1000)
    img_array = None

    try:
        if image:
            contents = await image.read()
            nparr = np.frombuffer(contents, np.uint8)
            import cv2
            img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif base64Image:
            if "," in base64Image:
                base64Image = base64Image.split(",")[1]
            img_data = base64.b64decode(base64Image)
            nparr = np.frombuffer(img_data, np.uint8)
            import cv2
            img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as err:
        return DetectionResponse(
            normalizedPlate=None,
            confidence=0.0,
            cameraId=cameraId,
            gateType=gateType,
            detectedAt=detected_at,
            status="error"
        )

    if img_array is None:
        return DetectionResponse(
            normalizedPlate=None,
            confidence=0.0,
            cameraId=cameraId,
            gateType=gateType,
            detectedAt=detected_at,
            status="no_plate_detected"
        )

    # Perform OCR on image
    normalized, conf, raw = extract_plate_from_image(img_array)

    if not normalized:
        return DetectionResponse(
            normalizedPlate=None,
            confidence=0.0,
            cameraId=cameraId,
            gateType=gateType,
            detectedAt=detected_at,
            rawText=raw,
            status="no_plate_detected"
        )

    requires_confirmation = conf < LPR_CONFIDENCE_THRESHOLD

    result = DetectionResponse(
        normalizedPlate=normalized,
        confidence=conf,
        cameraId=cameraId,
        gateType=gateType,
        detectedAt=detected_at,
        rawText=raw,
        requiresOperatorConfirmation=requires_confirmation,
        status="detected"
    )

    # Post signed event to Convex
    queue_mgr.post_event_directly({
        "cameraId": cameraId,
        "eventType": "PLATE_DETECTED",
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "plateNumber": normalized,
        "confidence": conf,
        "floor": "G",
        "zone": "Gate A" if gateType == "entry" else "Gate B",
        "rawText": raw,
        "requiresConfirmation": requires_confirmation
    })

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
