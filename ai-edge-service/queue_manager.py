"""
ParkNex Offline Event Queue & Cloud Sync Manager
Maintains an embedded SQLite buffer for edge resilience during internet downtime.
Automatically drains and posts cryptographically signed event batches to Convex once reconnected.
"""

import sqlite3
import json
import time
import hmac
import hashlib
import base64
import threading
import uuid
import requests
from typing import List, Dict, Any, Optional
from config import SQLITE_DB_PATH, CONVEX_HTTP_URL, SHARED_SECRET

class EventQueueManager:
    def __init__(self, db_path: str = SQLITE_DB_PATH, convex_url: str = CONVEX_HTTP_URL, secret: str = SHARED_SECRET):
        self.db_path = db_path
        self.convex_url = convex_url.rstrip("/")
        self.secret = secret
        self.lock = threading.Lock()
        self._init_db()
        self.is_running = True
        self.sync_thread = threading.Thread(target=self._drain_loop, daemon=True)
        self.sync_thread.start()

    def _init_db(self):
        with self.lock:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS event_queue (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    eventId TEXT UNIQUE NOT NULL,
                    payload TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    createdAt INTEGER NOT NULL,
                    retries INTEGER NOT NULL DEFAULT 0,
                    lastError TEXT
                )
            """)
            conn.commit()
            conn.close()

    def generate_hmac_signature(self, body_text: str, timestamp_ms: int) -> str:
        """Generates base64 HMAC-SHA256 signature for Convex HTTP Action."""
        payload_to_sign = f"{timestamp_ms}.{body_text}".encode('utf-8')
        h = hmac.new(self.secret.encode('utf-8'), payload_to_sign, hashlib.sha256)
        return base64.b64encode(h.digest()).decode('utf-8')

    def enqueue_event(self, event_dict: Dict[str, Any]) -> str:
        """
        Enqueues an event into the local SQLite database.
        Returns eventId.
        """
        event_id = event_dict.get("eventId") or str(uuid.uuid4())
        event_dict["eventId"] = event_id
        payload_str = json.dumps(event_dict)
        now = int(time.time() * 1000)

        with self.lock:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO event_queue (eventId, payload, status, createdAt, retries)
                    VALUES (?, ?, 'PENDING', ?, 0)
                """, (event_id, payload_str, now))
                conn.commit()
            except sqlite3.IntegrityError:
                pass # Deduplicated locally
            finally:
                conn.close()

        return event_id

    def post_event_directly(self, event_dict: Dict[str, Any]) -> bool:
        """Attempts direct post to Convex, falls back to queue on error."""
        event_id = event_dict.get("eventId") or str(uuid.uuid4())
        event_dict["eventId"] = event_id
        payload_str = json.dumps(event_dict)
        timestamp_ms = int(time.time() * 1000)
        signature = self.generate_hmac_signature(payload_str, timestamp_ms)

        endpoint = f"{self.convex_url}/cctv/events"
        try:
            res = requests.post(
                endpoint,
                data=payload_str,
                headers={
                    "Content-Type": "application/json",
                    "x-parknex-signature": signature,
                    "x-parknex-timestamp": str(timestamp_ms)
                },
                timeout=3.5
            )
            if res.status_code == 200:
                return True
            else:
                self.enqueue_event(event_dict)
                return False
        except Exception as e:
            # Network unreachable -> enqueue for offline sync
            self.enqueue_event(event_dict)
            return False

    def get_queue_stats(self) -> Dict[str, int]:
        """Returns count of pending and processed events in SQLite queue."""
        with self.lock:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT status, count(*) FROM event_queue GROUP BY status")
            rows = cursor.fetchall()
            conn.close()

        stats = {"PENDING": 0, "SYNCED": 0, "FAILED": 0}
        for status, count in rows:
            stats[status] = count
        return stats

    def _drain_loop(self):
        """Background worker draining uncommitted offline events in batches."""
        while self.is_running:
            try:
                self._drain_batch()
            except Exception as e:
                print(f"[QueueManager] Drain loop error: {e}")
            time.sleep(3.0)

    def _drain_batch(self):
        with self.lock:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, eventId, payload, retries FROM event_queue
                WHERE status = 'PENDING'
                ORDER BY createdAt ASC
                LIMIT 25
            """)
            rows = cursor.fetchall()
            conn.close()

        if not rows:
            return

        batch_events = []
        row_ids = []
        for row_id, event_id, payload_str, retries in rows:
            try:
                item = json.loads(payload_str)
                batch_events.append(item)
                row_ids.append(row_id)
            except Exception:
                pass

        if not batch_events:
            return

        payload_str = json.dumps(batch_events)
        timestamp_ms = int(time.time() * 1000)
        signature = self.generate_hmac_signature(payload_str, timestamp_ms)

        endpoint = f"{self.convex_url}/cctv/events"
        try:
            res = requests.post(
                endpoint,
                data=payload_str,
                headers={
                    "Content-Type": "application/json",
                    "x-parknex-signature": signature,
                    "x-parknex-timestamp": str(timestamp_ms)
                },
                timeout=5.0
            )

            if res.status_code == 200:
                with self.lock:
                    conn = sqlite3.connect(self.db_path)
                    cursor = conn.cursor()
                    cursor.execute(f"""
                        UPDATE event_queue
                        SET status = 'SYNCED'
                        WHERE id IN ({','.join(['?']*len(row_ids))})
                    """, row_ids)
                    conn.commit()
                    conn.close()
                print(f"[QueueManager] Successfully synchronized {len(batch_events)} offline events with Convex.")
            else:
                with self.lock:
                    conn = sqlite3.connect(self.db_path)
                    cursor = conn.cursor()
                    cursor.execute(f"""
                        UPDATE event_queue
                        SET retries = retries + 1, lastError = ?
                        WHERE id IN ({','.join(['?']*len(row_ids))})
                    """, [f"HTTP {res.status_code}"] + row_ids)
                    conn.commit()
                    conn.close()
        except Exception as conn_err:
            # Network still offline, will retry next cycle
            pass

    def stop(self):
        self.is_running = False
