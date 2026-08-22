"""
ParkNex RTSP CCTV Stream Reader
Multi-threaded OpenCV VideoCapture client with automatic exponential-backoff reconnection
and frame-drop protection for real-time edge processing.
"""

import time
import threading
from typing import Optional, Dict, Any
import numpy as np

class CctvStreamReader:
    def __init__(self, camera_config: Dict[str, Any]):
        self.config = camera_config
        self.camera_id = camera_config.get("cameraId", "unknown")
        self.rtsp_url = camera_config.get("rtspUrl", "")
        self.name = camera_config.get("name", self.camera_id)

        self.latest_frame: Optional[np.ndarray] = None
        self.frame_lock = threading.Lock()
        self.is_connected = False
        self.is_running = True
        self.last_frame_time = 0
        self.fps = 0.0

        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()

    def _capture_loop(self):
        import cv2

        reconnect_delay = 1.0

        while self.is_running:
            if not self.rtsp_url:
                time.sleep(2.0)
                continue

            cap = cv2.VideoCapture(self.rtsp_url)
            # Set buffer size to 1 to reduce RTSP latency
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if not cap.isOpened():
                self.is_connected = False
                time.sleep(min(reconnect_delay, 15.0))
                reconnect_delay = min(reconnect_delay * 1.5, 30.0)
                continue

            self.is_connected = True
            reconnect_delay = 1.0
            frame_count = 0
            start_time = time.time()

            while self.is_running:
                ret, frame = cap.read()
                if not ret:
                    self.is_connected = False
                    break

                now = time.time()
                frame_count += 1
                if now - start_time >= 1.0:
                    self.fps = round(frame_count / (now - start_time), 1)
                    frame_count = 0
                    start_time = now

                with self.frame_lock:
                    self.latest_frame = frame
                    self.last_frame_time = now

                # Small sleep to yield CPU
                time.sleep(0.01)

            cap.release()
            self.is_connected = False
            time.sleep(2.0)

    def get_latest_frame(self) -> Optional[np.ndarray]:
        """Returns the most recent frame thread-safely."""
        with self.frame_lock:
            if self.latest_frame is not None:
                return self.latest_frame.copy()
            return None

    def get_status(self) -> Dict[str, Any]:
        """Returns camera connection telemetry."""
        is_stale = (time.time() - self.last_frame_time) > 4.0 if self.last_frame_time > 0 else True
        status = "ONLINE" if (self.is_connected and not is_stale) else "OFFLINE"
        return {
            "cameraId": self.camera_id,
            "name": self.name,
            "status": status,
            "fps": self.fps if status == "ONLINE" else 0.0,
            "lastFrameTime": self.last_frame_time,
            "type": self.config.get("type", "FLOOR"),
            "floor": self.config.get("floor", "B2"),
            "zone": self.config.get("zone", "Zone A"),
            "webrtcUrl": self.config.get("webrtcUrl"),
            "hlsUrl": self.config.get("hlsUrl")
        }

    def stop(self):
        self.is_running = False
