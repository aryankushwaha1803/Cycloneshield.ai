# CYCLONESHIELD AI

### Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster
*An AI-powered, real-data disaster intelligence platform for authority decision-support and emergency early warning.*

---

## 1. Overview & Architectural Philosophy

CycloneShield AI was built to solve a critical issue in emergency response hackathons: **fake dashboards with hardcoded numbers**. In CycloneShield AI, **the Absolute Real-Data Rule is strictly enforced**:

1. **Every weather metric** originates from real numerical weather prediction models (ECMWF & NOAA GFS via Open-Meteo).
2. **Every cyclone track coordinate** originates from authoritative meteorological feeds (NOAA NHC live telemetry or official IMD RSMC & IBTrACS best-track archives).
3. **Every storm-surge number** is calculated using deterministic Jelesnianski / SLOSH physical equations (barometric deficit + wind stress setup).
4. **Every hospital, bridge, and power station** is queried from real OpenStreetMap Overpass geospatial nodes.
5. **AI reasoning** is provided by Google Gemini analyzing structured, deterministic data without hallucinating numerical measurements.
6. **Alerts & early warnings** are role-gated and strictly distinguished between `LIVE` and `SIMULATION ONLY`.

---

## 2. Services & Credentials Matrix

| Service / Subsystem | Required? | Purpose | Environment Variable | Default Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Numerical Weather Prediction** | **No** | Live winds, pressure, 24h rainfall, forecasts | `WEATHER_PROVIDER`, `WEATHER_API_KEY` | **Open-Meteo API** (Free, Live, No Key Needed) |
| **Cyclone Track Feeds** | **No** | Real-time fixes & official historical archives | `CYCLONE_PROVIDER` | **NOAA NHC Live + IMD RSMC Archives** (Verified) |
| **Google Gemini AI** | **Recommended** | Multi-hazard reasoning & official advisories | `GEMINI_API_KEY` | Shows "Not Configured" if missing; **never fakes AI answers** |
| **Google Earth Engine (GEE)** | **Optional** | Sentinel-2 multispectral & CHIRPS satellite tiles | `GEE_PROJECT_ID`, `GEE_SERVICE_ACCOUNT_KEY_PATH` | Real NASA GIBS & OpenTopo raster fallback with provenance tag |
| **OpenStreetMap Infrastructure** | **No** | Hospitals, shelters, power grid, bridges | *None (Overpass API)* | Live Overpass query with persistent coastal DB cache |
| **Emergency Early Warning** | **Optional** | Live SMS broadcast to coastal authorities | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Dispatches in **SIMULATION MODE ONLY** if keys are absent |
| **Database Persistence** | **No** | Relational storage of tracks, risk, alerts | `DATABASE_URL` | Defaults to SQLite (`cycloneshield.db`); supports PostgreSQL |

---

## 3. Setup Instructions for Real Services

### A. Weather API Setup (Open-Meteo vs OpenWeatherMap)
- **Zero-setup Default:** Open-Meteo is enabled out-of-the-box (`WEATHER_PROVIDER=open-meteo`). No account or key is required.
- **Optional OpenWeatherMap:**
  1. Register at [OpenWeatherMap](https://openweathermap.org/api).
  2. In `backend/.env`, set:
     ```env
     WEATHER_PROVIDER=openweathermap
     WEATHER_API_KEY=your_actual_openweathermap_key
     ```

### B. Google Gemini API Setup
1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. In `backend/.env`, set:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. When configured, Gemini generates structured multi-hazard reasoning, evacuation priority guidance, and public broadcast advisories based on the deterministic risk calculations.

### C. Google Earth Engine (GEE) Setup
1. Create a Google Cloud Project and enable the Earth Engine API at [earthengine.google.com](https://earthengine.google.com/).
2. Create a Service Account in GCP Console and download the JSON key.
3. In `backend/.env`, set:
   ```env
   GEE_PROJECT_ID=your-gcp-project-id
   GEE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/service-account.json
   ```
4. If GEE credentials are not provided, the platform automatically labels GEE as `NOT_CONFIGURED` in the Data Status Center, and loads authenticated NASA GIBS / Open GIS satellite layers with explicit provenance tags.

### D. Twilio Early-Warning SMS Setup
1. Create a free account at [Twilio](https://www.twilio.com/).
2. In `backend/.env`, set:
   ```env
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_FROM_NUMBER=+1234567890
   ```
3. When configured, dispatches operate in **LIVE** mode. When unconfigured, dispatches operate in **SIMULATION ONLY** mode with zero false delivery claims.

### E. Database Setup
- By default, CycloneShield uses SQLite for zero-friction local execution: `DATABASE_URL=sqlite:///./cycloneshield.db`.
- For PostgreSQL in production, set:
  ```env
  DATABASE_URL=postgresql://postgres:password@localhost:5432/cycloneshield
  ```

---

## 4. Installation & Quick Start

### Prerequisites
- Python 3.11+
- Node.js v18+ / npm

### Step 1: Clone or Navigate to Project
```bash
cd cycloneshield-ai
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run automated tests to verify all integrations:
pytest -v

# Start FastAPI backend server:
python main.py
```
*Backend runs on `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).*

### Step 3: Frontend Setup
In a separate terminal window:
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Hackathon Judge Demonstration Walkthrough

When demonstrating CycloneShield AI to hackathon judges, follow this sequence:

1. **Verify Real Telemetry & Data Status**:
   - Click the **Live Data Indicator** (`LIVE DATA ●`) in the top navigation bar.
   - Show the **Live Data Status Center** inspecting all 6 subsystems with latency, endpoints, and credentials status.
2. **Open Judge Transparency Panel**:
   - Click **How This Works** in the header.
   - Walk the judges through the taxonomy:
     - **Observed:** Satellite imagery, weather stations, official cyclone track coordinates.
     - **Modeled:** Parametric Jelesnianski storm surge, rainfall damage pathways, infrastructure exposure.
     - **AI-Generated:** Gemini structured multi-hazard reasoning and public broadcast advisories.
3. **Trigger "Launch Live Analysis"**:
   - Click **Launch Live Analysis** in the header.
   - Watch the automated 12-stage pipeline sequentially ingest telemetry, run the SLOSH equations, query OpenStreetMap assets, and invoke Gemini reasoning.
4. **Inspect "Why is this score X?"**:
   - In the Exposure Statistics row, click **Why 84?** to display the exact factor decomposition ($0.25S + 0.20W + 0.20R + 0.20I + 0.15E$).
5. **Inspect "Why this area?"**:
   - Click on Sector 1 Lowlands or Sector 2 Estuary Corridor in the Evacuation Priority Engine to inspect population, storm surge, rainfall, nearest shelter distance, and road vulnerability.
6. **Switch Historical Cyclone**:
   - Click the **Target Storm** selector in the header to switch between **Cyclone Biparjoy (2023)**, **Cyclone Fani (2019)**, **Cyclone Amphan (2020)**, and **Hurricane Ian (2022)**.
   - Observe the map, wind radii, and risk models adapt dynamically.
7. **Test Emergency Warning Broadcast**:
   - Switch role to `DISASTER_AUTHORITY`.
   - Dispatch an early warning alert via SMS or Webhook and verify the audit log recording `Mode: LIVE` or `Mode: SIMULATION ONLY`.
