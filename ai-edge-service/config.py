"""
ParkNex CCTV Edge Service - Configuration Loader
Loads camera endpoints, parking slot polygon coordinates, plate ROIs, and secrets.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

CONVEX_HTTP_URL = os.getenv("CONVEX_HTTP_URL", "https://agreeable-tapir-260.convex.site")
SHARED_SECRET = os.getenv("AI_EDGE_SHARED_SECRET", "PARKNEX_EDGE_AI_SHARED_SECRET_2026")
CONFIG_FILE = os.getenv("CAMERAS_CONFIG_FILE", str(BASE_DIR / "cameras_config.json"))
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", str(BASE_DIR / "events_queue.db"))
OCCUPANCY_FRAME_THRESHOLD = int(os.getenv("OCCUPANCY_FRAME_THRESHOLD", "5"))
LPR_CONFIDENCE_THRESHOLD = float(os.getenv("LPR_CONFIDENCE_THRESHOLD", "0.75"))

def load_cameras_config() -> List[Dict[str, Any]]:
    """Loads configured camera definitions from JSON."""
    if not os.path.exists(CONFIG_FILE):
        return []
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("cameras", [])
    except Exception as e:
        print(f"[Config] Error loading camera config: {e}")
        return []

def save_cameras_config(cameras: List[Dict[str, Any]]) -> bool:
    """Persists camera configurations to JSON."""
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump({"cameras": cameras}, f, indent=2)
        return True
    except Exception as e:
        print(f"[Config] Error saving camera config: {e}")
        return False
