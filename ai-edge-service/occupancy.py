"""
ParkNex Space Occupancy Tracking Module
Computes geometric overlap between detected vehicle bounding boxes and configured slot polygons.
Implements multi-frame hysteresis state machine to eliminate flickering from shadows or transients.
"""

from typing import List, Dict, Any, Optional
import numpy as np

def point_inside_polygon(point: List[float], polygon: List[List[float]]) -> bool:
    """Ray-casting algorithm for point-in-polygon test (all normalized coordinates)."""
    x, y = point[0], point[1]
    n = len(polygon)
    inside = False

    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

def polygon_intersection_ratio(bbox: List[float], polygon: List[List[float]]) -> float:
    """Estimates intersection between bbox [x, y, w, h] and polygon."""
    bx, by, bw, bh = bbox
    cx, cy = bx + bw / 2, by + bh / 2

    # Check center point
    if point_inside_polygon([cx, cy], polygon):
        return 0.85

    # Check 4 corner points
    corners = [
        [bx, by],
        [bx + bw, by],
        [bx + bw, by + bh],
        [bx, by + bh]
    ]
    inside_count = sum(1 for p in corners if point_inside_polygon(p, polygon))
    return inside_count / 4.0

class SpaceOccupancyTracker:
    def __init__(self, slot_configs: List[Dict[str, Any]], frame_threshold: int = 5):
        """
        slot_configs: list of {"slotId": "b2-a01", "polygon": [[x1, y1], [x2, y2], ...]}
        frame_threshold: number of consecutive frames required to transition state
        """
        self.slot_configs = slot_configs
        self.frame_threshold = frame_threshold
        # State tracking per slotId: {"state": "available", "consecutive_frames": 0, "candidate_state": "available", "confidence": 0.0}
        self.slots_state: Dict[str, Dict[str, Any]] = {}

        for slot in slot_configs:
            slot_id = slot.get("slotId")
            if slot_id:
                self.slots_state[slot_id] = {
                    "state": "available",
                    "consecutive_frames": 0,
                    "candidate_state": "available",
                    "confidence": 1.0
                }

    def update(self, vehicle_detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluates frame vehicle detections against slot polygons.
        Returns list of state change events: [{"slotId": "b2-a01", "status": "occupied", "confidence": float}]
        """
        events = []

        for slot in self.slot_configs:
            slot_id = slot.get("slotId")
            polygon = slot.get("polygon")
            if not slot_id or not polygon:
                continue

            current_slot_info = self.slots_state.get(slot_id)
            if not current_slot_info:
                continue

            # Determine if any vehicle occupies this slot in the current frame
            max_overlap = 0.0
            max_conf = 0.0

            for v in vehicle_detections:
                bbox = v.get("bbox", [0, 0, 0, 0])
                overlap = polygon_intersection_ratio(bbox, polygon)
                if overlap > 0.4:
                    if overlap > max_overlap:
                        max_overlap = overlap
                        max_conf = v.get("confidence", 0.9)

            frame_detected_occupied = (max_overlap > 0.4)
            instant_state = "occupied" if frame_detected_occupied else "available"
            instant_conf = max_conf if frame_detected_occupied else 0.98

            # Multi-frame hysteresis state machine
            if instant_state == current_slot_info["candidate_state"]:
                current_slot_info["consecutive_frames"] += 1
            else:
                current_slot_info["candidate_state"] = instant_state
                current_slot_info["consecutive_frames"] = 1

            # Transition state if threshold reached
            if (
                current_slot_info["consecutive_frames"] >= self.frame_threshold
                and current_slot_info["candidate_state"] != current_slot_info["state"]
            ):
                new_state = current_slot_info["candidate_state"]
                current_slot_info["state"] = new_state
                current_slot_info["confidence"] = instant_conf

                events.append({
                    "slotId": slot_id,
                    "status": new_state,
                    "confidence": round(instant_conf, 3),
                    "consecutiveFrames": current_slot_info["consecutive_frames"]
                })

        return events

    def get_current_states(self) -> Dict[str, Dict[str, Any]]:
        return self.slots_state
