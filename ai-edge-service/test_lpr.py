"""
Test client for ParkNex Edge AI License Plate Recognition Service
"""
import requests
import json
import base64

API_URL = "http://localhost:8000"

def test_health():
    print("Testing /health endpoint...")
    try:
        res = requests.get(f"{API_URL}/health", timeout=3)
        print(f"Health Status [{res.status_code}]:", json.dumps(res.json(), indent=2))
        return res.status_code == 200
    except Exception as e:
        print(f"Health check failed (Server may not be running locally): {e}")
        return False

def test_detection():
    print("\nTesting /detect-plate endpoint...")
    try:
        # 1x1 blank PNG base64
        dummy_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        data = {
            "base64Image": dummy_base64,
            "cameraId": "cam-entry-01",
            "gateType": "entry"
        }
        res = requests.post(f"{API_URL}/detect-plate", data=data, timeout=3)
        print(f"Detection Status [{res.status_code}]:", json.dumps(res.json(), indent=2))
        return res.status_code == 200
    except Exception as e:
        print(f"Detection test failed: {e}")
        return False

if __name__ == "__main__":
    print("=== ParkNex Edge AI Service Test ===")
    test_health()
    test_detection()
