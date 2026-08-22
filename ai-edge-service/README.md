# ParkNex CCTV Edge Service

FastAPI-based Edge Computer Vision daemon for on-premises CCTV RTSP ingestion, License Plate Recognition (PaddleOCR), Parking Space Occupancy Tracking, and cryptographically signed cloud synchronization with Convex.

---

## System Architecture

```text
[IP CCTV Cameras (RTSP)] ──> [MediaMTX Bridge] ──> [WebRTC / HLS Player (Browser)]
           │
           └──> [Python Edge Service]
                     │
                     ├──> 1. PaddleOCR ANPR Engine (Entry/Exit Gates)
                     ├──> 2. Vehicle Detector & Slot Polygon Overlap Tracker
                     ├──> 3. SQLite Offline Buffer (events_queue.db)
                     └──> 4. HMAC-SHA256 Signed HTTP POST ──> [Convex Cloud /cctv/events]
```

---

## 1. Prerequisites & Installation

### Python Environment (Python 3.9 - 3.11 recommended)
```bash
cd ai-edge-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### MediaMTX Setup (RTSP -> WebRTC & HLS Bridge)
1. Download the latest MediaMTX release for your OS from: https://github.com/bluenviron/mediamtx/releases
2. Place `mediamtx.yml` in the MediaMTX binary folder or pass the config:
```bash
./mediamtx ai-edge-service/mediamtx.yml
```

---

## 2. Configuration (`cameras_config.json`)

Configure your RTSP camera feeds and parking slot polygon coordinates in `ai-edge-service/cameras_config.json`:

```json
{
  "cameras": [
    {
      "cameraId": "cam-entry-01",
      "name": "Gate A Entry ANPR Camera",
      "type": "ENTRY",
      "floor": "G",
      "zone": "Entry Gate A",
      "rtspUrl": "rtsp://admin:pass@192.168.1.101:554/stream1",
      "webrtcUrl": "http://127.0.0.1:8889/cam-entry-01",
      "hlsUrl": "http://127.0.0.1:8888/cam-entry-01/index.m3u8",
      "plateRoi": {
        "x": 0.25,
        "y": 0.40,
        "width": 0.50,
        "height": 0.45
      }
    },
    {
      "cameraId": "cam-floor-b2-zonea",
      "name": "Floor B2 Zone A Overhead CCTV",
      "type": "FLOOR",
      "floor": "B2",
      "zone": "Zone A",
      "rtspUrl": "rtsp://admin:pass@192.168.1.102:554/stream1",
      "webrtcUrl": "http://127.0.0.1:8889/cam-floor-b2-zonea",
      "hlsUrl": "http://127.0.0.1:8888/cam-floor-b2-zonea/index.m3u8",
      "slotPolygons": [
        {
          "slotId": "b2-a01",
          "polygon": [[0.10, 0.20], [0.22, 0.20], [0.22, 0.55], [0.10, 0.55]]
        }
      ]
    }
  ]
}
```

---

## 3. Environment Variables (`.env`)

Create `.env` in `ai-edge-service/`:

```bash
CONVEX_HTTP_URL=https://agreeable-tapir-260.convex.site
AI_EDGE_SHARED_SECRET=PARKNEX_EDGE_AI_SHARED_SECRET_2026
OCCUPANCY_FRAME_THRESHOLD=5
LPR_CONFIDENCE_THRESHOLD=0.75
```

---

## 4. Running the Service

```bash
source venv/bin/activate
python main.py
```
The edge service will start on `http://0.0.0.0:8000`.

---

## 5. Offline Queueing & Recovery

If internet access is interrupted:
1. The service automatically writes all camera detection events into `events_queue.db`.
2. As soon as the network or Convex cloud is reachable, the background drain worker flushes queued events in chronological order with cryptographic HMAC signatures.
