# 🛡️ DISASTERSHIELD AI

> **AI-Based Early Warning, Multi-Hazard Risk Monitoring, Geo-Spatial Intelligence and Disaster Prediction System for North Eastern Region of India and Pan-India**
> 
> *“From Historical Records to AI-Powered Early Warning.”*  
> *“Analyze. Predict. Warn. Protect.”*

---

## 📌 1. Project Overview & Vision

**DisasterShield AI** is a production-grade, national-scale multi-hazard disaster intelligence, geo-spatial risk monitoring, and early warning platform. 

While offering specialized, hyper-local geotechnical depth for the **8 North Eastern Region (NER) States** (*Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim*), the platform provides **universal multi-hazard coverage across ANY location in India** (*Western Ghats, Himalayan states, coastal cyclonic corridors, and metropolitan centers*).

The platform answers five fundamental disaster questions:
1. **“What happened here before?”** (Historical disaster catalog and frequency)
2. **“What is happening here now?”** (Real-time telemetry, IMD precipitation, radar sensors)
3. **“What could happen next?”** (AI/ML-based multi-hazard risk forecast and trend)
4. **“Why is this location at risk?”** (SHAP-inspired geotechnical and hydrological explainability)
5. **“What should people and authorities do?”** (Actionable early warning directives and CAP protocols)

---

## ⚡ 2. Signature Flagship Innovations

### 1️⃣ PAST → PRESENT → FUTURE Triad Model
- **PAST**: Multi-decade verified historical disaster memory (GSI & IMD archives).
- **PRESENT**: Real-time multi-sensor telemetry (24h rainfall, pore pressure, inclinometers, Sentinel-1 radar ground displacement, river discharge).
- **FUTURE**: Random Forest and Gradient Boosted ML risk forecasting (24h and 7-day predictive horizons).
- **Triad Visualization**: Multi-epoch charts distinguishing *OBSERVED* vs *MODELLED* vs *FORECAST* data.

### 2️⃣ Universal AI Location Risk Analyzer
- Search any Indian state, district, city, town, village, highway corridor, or raw GPS coordinates (e.g., *Shillong, Gangtok, Guwahati, Darjeeling, Siliguri, Kolkata, Dehradun, Kedarnath, Mumbai, Munnar*).
- Generates **13 Structured Intelligence Sections**:
  1. Location & Geomorphological Summary
  2. Current Environmental & Meteorological Conditions
  3. Historical Disaster Pattern & Frequency
  4. Current Calibrated Multi-Hazard Risk Score
  5. 24h & 7-Day Future Predictive Outlook
  6. Primary Hazard Profiles (*Landslide, Flood, Earthquake, Extreme Rainfall*)
  7. Key Risk Drivers & Geotechnical Triggers
  8. Exposed Assets & Vulnerable Infrastructure
  9. Potential Community & Socio-Economic Impact
  10. Actionable Precautionary Directives
  11. Multi-Channel Early Warning Status (CAP Protocol)
  12. Institutional Data Quality & Completeness
  13. Model Limitations & Predictive Uncertainty Bounds

### 3️⃣ Explainable AI (XAI) & SHAP Attribution (“WHY RED?”)
- Model feature importance decomposition:
  - Precipitation Accumulation (%)
  - DEM Slope Angle & Terrain Roughness (%)
  - Soil Moisture & Pore Pressure Saturation (%)
  - Historical Susceptibility Baseline (%)
  - Lithology & Elevation (%)
- Positive Risk Accelerators ($+$) vs Mitigating Factors ($-$).

### 4️⃣ What-If AI Disaster Scenario Simulator
- Interactive sliders for **Rainfall Surge (+30%, +50%, +100%)**, **Soil Moisture Saturation**, **River Level Swell**, and **Seismic Ground Shocks**.
- Instant dynamic recalculation of Landslide and Flood risk scores with *Before vs After* comparative graphs and AI rationale.

### 5️⃣ Citizen → AI Pre-Screening → Authority Verification Loop
- **Citizen Hazard Reporting**: Citizens report field hazards (*Landslides, Road Cracks, Rockfalls, Floods, Blocked Roads, Fallen Trees, Damaged Bridges*) with GPS coordinates and photos.
- **Authority Command Center**: District Magistrates and SDRF teams review, verify, escalate, and resolve citizen submissions, instantly updating public GIS hazard markers.

### 6️⃣ Scientific Earthquake & Seismic Intelligence Module
- **BIS IS 1893:2016** Seismic Zone Classification (Zones II to V).
- USGS NEIC historical catalog integration with depth, epicenter distance, and magnitude visual scale tiers (*Micro, Minor, Light, Moderate, Strong, Major, Great*).
- Co-seismic landslide susceptibility evaluation.
- **Scientific Rigor**: Strict disclaimer that exact earthquake timing cannot be predicted.

### 7️⃣ Interactive Hackathon Presentation Mode
- Integrated 18-step interactive presentation tour walking judges and stakeholders through every core capability in under 3 minutes.

---

## 🔬 3. Scientific Rules & Zero-Hallucination Policy

1. **No Richter Scale Misuse**: Richter/Moment Magnitude scales are **never** used for landslides or floods. Landslides utilize slope degree, pore-water pressure, and rainfall thresholds; floods utilize river discharge, catchment saturation, and floodplain elevation.
2. **Unified 0–100 Risk Scale**:
   - `0–20`: **VERY LOW** (🟢 Safe Baseline)
   - `21–40`: **LOW** (🟢 Normal Monitoring)
   - `41–60`: **MODERATE** (🟡 Watch Phase)
   - `61–80`: **HIGH** (🟠 Alert Phase · Preparedness)
   - `81–100`: **CRITICAL** (🔴 RED ALERT · Evacuation Protocol)
3. **Institutional Citations**: Every measurement and prediction displays source citations (*IMD, CWC, GSI, NDMA, ISRO/Bhuvan, USGS, Open-Meteo*), timestamp, and data status.
4. **Transparent Offline Fallback**: In offline demo environments, synthetic values are explicitly labeled **“SYNTHETIC DEMO DATA”**.

---

## 🛠️ 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v6, Leaflet / React-Leaflet, Recharts, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0, WebSockets |
| **Machine Learning** | Scikit-Learn (Random Forest, Gradient Boosting), SHAP-inspired explainability, NumPy, Pandas, Joblib |
| **GIS & Geocoding** | Sentinel-1 SAR displacement baselines, Copernicus DEM elevation & slope engine, Gazetteer API |
| **Database** | SQLite (Dev) / PostgreSQL + PostGIS (Production) |
| **Authentication** | Passlib (PBKDF2/Bcrypt password hashing), Python-Jose (JWT tokens), Role-Based Access Control (RBAC) |
| **Localization** | Multilingual dictionary supporting English, Bengali (বাংলা), Assamese (অসমীয়া), Hindi (हिंदी), Nepali (नेपाली) |

---

## 🚀 5. Quick Start & Installation

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend API will be accessible at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🔑 6. Test Credentials & Demo Accounts

| Role | Username / Email | Password | Access Level |
|---|---|---|---|
| **Admin Command** | `epsitamaity629@gmail.com` / `epsita` | `password123` | Full Directorate & RBAC Control |
| **Authority / SDRF** | `sanjanajana464@gmail.com` / `sanjana` | `password123` | Authority Command & Incident Verification |
| **Citizen User** | `citizen@ner-ews.gov.in` / `citizen` | `citizen123` | Public Intelligence & Hazard Reporting |

---

## 📡 7. Core Backend API Endpoints

- `GET /api/location/search` & `POST /api/predict/search-location` — Universal place & coordinate risk prediction
- `POST /api/predict/route-analysis` — Corridor-by-corridor waypoint risk analysis
- `POST /api/ai/report` — Structured 13-section AI disaster intelligence report
- `POST /api/ai/simulate` — Dynamic What-If scenario simulation
- `POST /api/ai/chat` — Contextual AI disaster assistant
- `POST /api/predict/compare` — Side-by-side comparative hazard analysis
- `GET /api/ner/risk-indices` — 8 NER states & Pan-India regional risk indices
- `POST /api/earthquake/profile` — BIS IS 1893 seismic profile & historical events
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password` — Secure RBAC authentication

---

## ⚖️ 8. AI Safety & Scientific Disclaimer

> **IMPORTANT NOTICE:** DisasterShield AI provides risk estimates, early warning indicators, and decision-support intelligence based on currently available meteorological, geotechnical, hydrological, and seismic models. It does not guarantee that a disaster will or will not occur. Official emergency broadcasts from NDMA, SDMA, and local District Disaster Management Authorities (DDMA) must always take precedence. Exact earthquake timing cannot be reliably predicted by this system.

---

## 👥 Contributors & Acknowledgements

Developed for the **Ministry of Development of North Eastern Region (MDoNER)** and national disaster mitigation agencies across India.
- **Project Lead**: Epsita Maity (`epsitamaity629@gmail.com`)
- **Engineering**: Soumya Saha (`soumyasaha205@gmail.com`), Sanjana Jana (`sanjanajana464@gmail.com`), Monira Protappur (`monira.protappur@gmail.com`)