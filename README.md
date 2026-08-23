# ParkNex AI × RocketRide

> **AI-powered parking intelligence for smarter facilities and faster parking.**  
> *Built for the RocketRide Buildathon 2026.*

Live Demo: [https://parknex.vercel.app/](https://parknex.vercel.app/)

---

## 1. Overview & Executive Summary

**ParkNex AI** is a production-quality, multi-facility smart parking SaaS platform that transforms traditional parking structures into intelligent, autonomous mobility hubs. By leveraging **RocketRide AI Pipelines** as its core orchestration and validation engine, ParkNex eliminates driver search latency, resolves occupancy inconsistencies, detects barrier anomalies, processes high-throughput batch audits, and guarantees grounded factual assistance with human-in-the-loop oversight.

### Primary Customers
- Shopping Malls & Retail Megaplexes
- Commercial Parking Operators
- International Airports
- Multi-building Hospitals & Medical Centers
- University & Enterprise Corporate Campuses

### Key Problems Solved
1. **Driver Search Latency**: Reduces indoor navigation confusion through real-time Dijkstra spatial pathfinding and AI bay recommendations.
2. **Occupancy Inconsistency**: Synchronizes camera ANPR, physical barriers, sensor telemetry, and digital reservations into a single reactive source of truth.
3. **Double Space Assignments & Ghost Bookings**: Atomically prevents duplicate check-ins and detects phantom occupancy via continuous heuristic and LLM evaluation.
4. **Tailgating & Unregistered Movements**: Flags vehicles entering without registration or exiting without checkout directly into an operator AI Review Queue.
5. **Manual Investigation Overhead**: Reconciles thousands of batch barrier records in milliseconds with automated root-cause classification.

---

## 2. How RocketRide Powers ParkNex AI

RocketRide is the **core AI processing and validation engine** of ParkNex AI. Every critical mobility workflow executes through structured, portable `.pipe` definitions that enforce multi-stage transformation, LLM analysis, confidence scoring, and automated threshold gating.

```
┌─────────────────────────┐
│ Customer / Barrier Event│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   ParkNex API Layer     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   RocketRide Service    │
│  (Server-Side Adapter)  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   RocketRide Pipeline   │
│   (5 Specialist .pipe)  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Typed Output Validation │
│   & Confidence Guard    │
└────────────┬────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
High Confidence    Low Confidence / Anomaly
     │               │
     ▼               ▼
┌──────────────┐   ┌───────────────────────────┐
│ Atomic DB    │   │ Human-in-the-Loop Queue   │
│ Persistence  │   │ (/admin/ai-review)        │
└──────────────┘   └───────────────────────────┘
```

---

## 3. RocketRide Pipelines Architecture

All pipelines are stored in `/rocketride` as standard RocketRide JSON files and committed to version control:

| Pipeline File | Purpose | Key Nodes & Stages |
| :--- | :--- | :--- |
| [`parking-verification.pipe`](./rocketride/parking-verification.pipe) | Check-in validation & slot integrity | Input → Plate Regex Validator → Spatial State Checker → Verification AI → Confidence Guard (`≥0.85`) → Output |
| [`parking-recommendation.pipe`](./rocketride/parking-recommendation.pipe) | Destination-aware bay optimization | Input → Distance Matrix Scorer → Optimization AI → Ranking Validator → Output |
| [`parking-anomaly.pipe`](./rocketride/parking-anomaly.pipe) | Real-time incident & anomaly detection | Input → 11 Integrity Rules Engine → Incident AI Classifier → Severity Guard → Output |
| [`occupancy-reconciliation.pipe`](./rocketride/occupancy-reconciliation.pipe) | High-throughput batch traffic audit | Input → Row Sanitizer → Batch AI Specialist → Batch Integrity Guard → Output |
| [`parknex-assistant.pipe`](./rocketride/parknex-assistant.pipe) | Grounded contextual Q&A assistant | Input → Grounding Context Injector → Assistant AI → Anti-Hallucination Guard → Output |

---

## 4. Human-in-the-Loop AI Review Queue

ParkNex strictly enforces human oversight for high-impact actions and low-confidence decisions:
- **Configurable Confidence Threshold**: `AI_REVIEW_CONFIDENCE_THRESHOLD=0.85`
- **Actions Supported**: `APPROVE`, `REJECT`, `INVESTIGATE`, `RESOLVE`
- **Severity Levels**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- **Audit Trails**: Every decision captures operator email, cryptographic timestamp, diagnostic evidence, and rationale.

Route: `/admin/ai-review`

---

## 5. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Three.js / React Three Fiber (WebGL 3D Indoor Maps)
- **Database & Reactive State**: Convex Real-Time Backend
- **AI Orchestration**: RocketRide C++ Engine / Cloud APIs & Specialist Pipelines
- **Authentication**: NextAuth.js (Role-based access control for Customers and Operators)
- **Security & Cryptography**: HMAC-SHA256 Signed Passes & Digital Exit Tokens

---

## 6. Local Setup & Installation

### Prerequisites
- Node.js 20+
- npm or pnpm
- Convex Account (or local Convex instance)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/parknex.git
cd parknex
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate the necessary keys:
```bash
cp .env.example .env.local
```

Required keys:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
AUTH_SECRET=your_nextauth_secret_key_min_32_chars
ROCKETRIDE_URI=https://api.rocketride.ai
ROCKETRIDE_APIKEY=your_rocketride_api_key
AI_REVIEW_CONFIDENCE_THRESHOLD=0.85
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## 7. End-to-End Demo Script

To demonstrate the full ParkNex AI × RocketRide platform:

1. **Customer Self Check-In**:
   - Open `/customer/check-in`.
   - Enter plate `MH02AB1234`, select `Zone A`, space `A-01`, and destination `Food Court`.
   - Click **Verify & Start Parking Session** → Watch `parking-verification.pipe` run with live progress and confidence scoring.
2. **Interactive Customer Hub & Find My Car**:
   - Navigate to `/customer/dashboard` → Observe the live active session banner, duration ticker, and 2D/3D indoor pathfinding guidance.
3. **AI Space Recommendation**:
   - Click **AI Recommendation** → Select `Cinema` → Watch `parking-recommendation.pipe` suggest optimal bays based on live occupancy.
4. **Contextual AI Assistant**:
   - Click **Ask ParkNex AI** → Ask *"Where is my car?"* or *"How long have I parked?"* → Verified against live session database.
5. **ParkNex Command Center & Anomaly Detection**:
   - Open `/admin` (Command Center) → View live metrics and zone occupancy cards.
   - Click **Run Anomaly Audit** → `parking-anomaly.pipe` inspects active sessions for conflicts and routes issues to the Review Queue.
6. **Human-in-the-Loop Review**:
   - Open `/admin/ai-review` → Filter by `Pending` → Inspect anomaly evidence → Click **APPROVE**, **REJECT**, or **INVESTIGATE**.
7. **Batch Occupancy Reconciliation**:
   - Open `/admin/batch-reconciliation` → Click **Load Sample (Anomaly CSV)** → Click **Start Batch Processing** → Observe real-time row processing, anomaly breakdown, and review queue linking.
8. **RocketRide Telemetry**:
   - Open `/admin/ai-runs` → Inspect latency profiling, execution IDs, token usage, and cost estimation for every pipeline run.
9. **Express Checkout**:
   - Return to Customer Dashboard → Click **Checkout** → Session closes transactionally, the bay is released, and an exit event is logged.

---

## 8. Commercial Business Model (B2B SaaS)

ParkNex AI operates on a modular B2B enterprise subscription model:
1. **Facility Tier**: Base monthly license per facility based on total bays managed (e.g. 500 bays, 2,000 bays, 10,000+ bays).
2. **AI Telemetry & Pipeline Usage**: Usage-based volume pricing for high-throughput ANPR verification, batch reconciliation, and assistant queries.
3. **Enterprise SLA**: Multi-facility centralized Command Center, automated compliance auditing, and custom RocketRide node connectors.

---

## 9. Security & Production Standards

- **Server-Side AI Secrets**: `ROCKETRIDE_APIKEY` is strictly confined to server-side API routes and never exposed to client bundles or browser storage.
- **Zero Mock AI Data**: All metrics, confidence scores, and recommendations are computed from real database state and pipeline runs.
- **Zero PII Exposure**: Diagnostic logs redact personal identifiers while maintaining auditability.
- **Concurrency Protection**: Atomic Convex database mutations prevent race conditions during peak-hour simultaneous check-ins.

---

## 10. License

Developed for the **RocketRide Buildathon 2026**. All rights reserved.
