"""
ParkNex License Plate Recognition (LPR) Engine
Runs PaddleOCR on configurable camera ROIs, normalizes Indian vehicle registration plates,
and calculates true detection confidence.
"""

import re
from typing import Optional, Dict, Any, Tuple
import numpy as np

# Initialize PaddleOCR lazily or gracefully handle environment
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from paddleocr import PaddleOCR
            _ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            print("[LPR] PaddleOCR initialized successfully.")
        except Exception as e:
            print(f"[LPR] PaddleOCR initialization notice: {e}")
            _ocr_engine = False
    return _ocr_engine if _ocr_engine is not False else None

def normalize_indian_plate(raw_text: str) -> str:
    """
    Standardizes plate characters according to Indian MoRTH registration formats
    (e.g., 'KA 01 MJ 2026', 'MH02ZZ0001', 'DL-8C-AA-1234')
    """
    if not raw_text:
        return ""
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    # Format standard 8-11 character plate numbers
    if len(cleaned) >= 8 and len(cleaned) <= 11:
        state = cleaned[:2]
        rto = cleaned[2:4]
        series = cleaned[4:-4]
        number = cleaned[-4:]
        if series:
            return f"{state} {rto} {series} {number}"
        return f"{state} {rto} {number}"
    return cleaned

def extract_plate_from_image(
    image: np.ndarray,
    roi_config: Optional[Dict[str, float]] = None
) -> Tuple[Optional[str], float, str]:
    """
    Extracts text from the image or cropped ROI.
    Returns: (normalized_plate, confidence, raw_text)
    If no plate is detected, returns (None, 0.0, "")
    """
    if image is None:
        return None, 0.0, ""

    engine = get_ocr_engine()
    if engine is None:
        return None, 0.0, ""

    h, w = image.shape[:2]
    crop_img = image

    # Crop ROI if configured (normalized coordinates [0..1])
    if roi_config:
        rx = int(roi_config.get("x", 0) * w)
        ry = int(roi_config.get("y", 0) * h)
        rw = int(roi_config.get("width", 1.0) * w)
        rh = int(roi_config.get("height", 1.0) * h)

        rx = max(0, min(rx, w - 1))
        ry = max(0, min(ry, h - 1))
        rw = max(1, min(rw, w - rx))
        rh = max(1, min(rh, h - ry))

        crop_img = image[ry:ry+rh, rx:rx+rw]

    try:
        results = engine.ocr(crop_img, cls=True)
        if not results or not results[0]:
            return None, 0.0, ""

        raw_text_parts = []
        confidences = []

        for line in results[0]:
            text, conf = line[1]
            cleaned_line = re.sub(r'[^A-Z0-9]', '', text.upper())
            if cleaned_line:
                raw_text_parts.append(text)
                confidences.append(float(conf))

        if not raw_text_parts:
            return None, 0.0, ""

        raw_text = " ".join(raw_text_parts)
        normalized = normalize_indian_plate(raw_text)
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0

        if len(re.sub(r'[^A-Z0-9]', '', normalized)) < 4:
            return None, 0.0, raw_text

        return normalized, round(avg_confidence, 3), raw_text.strip()
    except Exception as e:
        print(f"[LPR] OCR inference error: {e}")
        return None, 0.0, ""
