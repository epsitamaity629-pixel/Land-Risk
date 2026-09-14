from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List

import ml_engine
import weather_service

router = APIRouter(prefix="/api", tags=["predictions"])


class PredictIn(BaseModel):
    slope_deg: float = 32
    rainfall_24h_mm: float = 40
    rainfall_7d_mm: float = 140
    soil_moisture_pct: float = 48
    pore_pressure_kpa: float = 22
    elevation_m: float = 900
    lithology: str = "weathered_shale"
    displacement_mm: float = 2.4
    tilt_deg: float = 0.8
    velocity_mm_h: float = 0.4
    rainfall_threshold_mm: float = 120


class MultiHazardIn(BaseModel):
    slope_deg: float = 28
    rainfall_24h_mm: float = 55
    rainfall_7d_mm: float = 180
    soil_moisture_pct: float = 65
    pore_pressure_kpa: float = 28
    elevation_m: float = 650
    lithology: str = "weathered_shale"
    displacement_mm: float = 3.2
    tilt_deg: float = 1.1
    distance_to_river_m: float = 1200
    river_basin_elevation_diff_m: float = 8.0
    drainage_density_km_km2: float = 2.8
    catchment_rainfall_48h_mm: float = 110.0


class SearchLocationIn(BaseModel):
    query: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RouteAnalysisIn(BaseModel):
    origin: str = "Siliguri"
    destination: str = "Gangtok"


@router.post("/predict-risk")
def predict_risk(body: PredictIn):
    return ml_engine.predict_from_dict(body.model_dump())


@router.post("/predict-risk/batch")
def predict_batch(items: List[PredictIn]):
    return [ml_engine.predict_from_dict(i.model_dump()) for i in items]


@router.post("/predict/multi-hazard")
def predict_multi_hazard_endpoint(body: MultiHazardIn):
    return ml_engine.predict_multi_hazard(body.model_dump())


@router.post("/predict/search-location")
async def search_location_and_predict(body: SearchLocationIn):
    """Universal search endpoint: takes place name or lat/lon coordinates,
    fetches live IMD/Open-Meteo weather & terrain, and returns dual Landslide + Flood risk prediction."""
    return await ml_engine.predict_for_location_query(
        query=body.query or "",
        lat=body.latitude,
        lon=body.longitude,
    )


@router.post("/predict/route-analysis")
def analyze_route(body: RouteAnalysisIn):
    """Segment-by-segment geotechnical & hydrological route corridor risk analysis."""
    return weather_service.analyze_route_hazard(body.origin, body.destination)


@router.get("/predict/route-analysis")
def analyze_route_get(origin: str = Query("Siliguri"), destination: str = Query("Gangtok")):
    return weather_service.analyze_route_hazard(origin, destination)


@router.get("/predict/gazetteer")
def get_gazetteer_suggestions(q: str = Query("", description="Search term for any place, district, hill station, city, or river")):
    """Returns universal geocoding & gazetteer suggestions matching query across India and worldwide."""
    return weather_service.search_gazetteer(q, limit=8)


class ReportIn(BaseModel):
    query: Optional[str] = ""
    location_data: Optional[dict] = None


class SimulateIn(BaseModel):
    query: Optional[str] = ""
    location_data: Optional[dict] = None
    rainfall_delta_pct: float = 0.0
    soil_moisture_delta_pct: float = 0.0
    seismic_shock_boost: float = 0.0
    scenario_preset: str = "custom"


class ChatIn(BaseModel):
    message: str
    context_location: Optional[str] = None
    location_data: Optional[dict] = None


class CompareIn(BaseModel):
    location_a: str = "Shillong"
    location_b: str = "Gangtok"


@router.post("/ai/report")
async def generate_ai_report(body: ReportIn):
    """Generates structured 9-section AI Disaster Intelligence Report for any searched location."""
    data = body.location_data
    if not data and body.query:
        data = await ml_engine.predict_for_location_query(body.query)
    if not data:
        data = await ml_engine.predict_for_location_query("Shillong")
    return ml_engine.generate_ai_disaster_intelligence_report(data)


@router.post("/ai/simulate")
async def simulate_scenario_endpoint(body: SimulateIn):
    """Dynamically recalculates multi-hazard risk under 'What If' rainfall and geotechnical surges."""
    data = body.location_data
    if not data and body.query:
        data = await ml_engine.predict_for_location_query(body.query)
    if not data:
        data = await ml_engine.predict_for_location_query("Shillong")
    return ml_engine.simulate_what_if_scenario(
        base_location_data=data,
        rainfall_delta_pct=body.rainfall_delta_pct,
        soil_moisture_delta_pct=body.soil_moisture_delta_pct,
        seismic_shock_boost=body.seismic_shock_boost,
        scenario_preset=body.scenario_preset,
    )


@router.post("/ai/chat")
async def ai_chat_assistant_endpoint(body: ChatIn):
    """Bhu-Surakha AI Assistant: answers disaster safety, hazard risk, historical inquiry, and recommendations."""
    return await ml_engine.chat_disaster_assistant(
        message=body.message,
        context_location=body.context_location,
        current_location_data=body.location_data,
    )


@router.post("/predict/compare")
async def compare_locations_endpoint(body: CompareIn):
    """Side-by-side comparative analysis of two Indian locations."""
    return await ml_engine.compare_locations_data(body.location_a, body.location_b)


@router.get("/ner/risk-indices")
def get_ner_and_pan_india_indices():
    """Returns regional risk indices for all 8 NER states and Pan-India hotspots."""
    base = ml_engine.get_regional_risk_indices()
    # Enrich NER states with normalised fields used by the new frontend
    enriched_states = []
    for st in base.get("ner_states", []):
        score = round(st.get("baseline_score", 65))
        enriched_states.append({
            **st,
            "risk_score": score,
            "status": (
                "CRITICAL" if score >= 80 else
                "HIGH"     if score >= 60 else
                "MODERATE" if score >= 40 else "LOW"
            ),
            "flood_risk": round(score * 0.9 + 2),
            "landslide_risk": round(score * 0.95),
        })
    # Enrich pan-India hotspots with normalised fields
    enriched_hotspots = []
    for h in base.get("pan_india_hotspots", []):
        # Generate per-city entries from the stations string
        stations_raw = h.get("stations", "")
        for city_raw in stations_raw.split(","):
            city = city_raw.strip()
            if not city:
                continue
            parts = city.split("(")
            name = parts[0].strip()
            state_hint = parts[1].replace(")", "").strip() if len(parts) > 1 else h.get("region", "")
            enriched_hotspots.append({
                "location": name,
                "state": state_hint,
                "risk_score": round(h.get("risk_index", 70)),
                "status": h.get("status", "HIGH"),
                "primary_hazard": h.get("primary_hazard", "Multi-Hazard"),
                "region": h.get("region", ""),
            })

    return {
        **base,
        "ner_states": enriched_states,
        "pan_india_hotspots": enriched_hotspots,
        "overall_ner_risk_score": round(base.get("ner_disaster_index", 73)),
        "overall_ner_status": (
            "CRITICAL" if base.get("ner_disaster_index", 73) >= 80 else
            "HIGH"     if base.get("ner_disaster_index", 73) >= 60 else "MODERATE"
        ),
        "active_alerts_count": base.get("total_active_alerts", 5),
        "critical_states_count": sum(1 for s in enriched_states if s["risk_score"] >= 80),
    }


class EarthquakeQueryIn(BaseModel):
    latitude: float = 25.57
    longitude: float = 91.88
    query: Optional[str] = "Shillong"


@router.post("/earthquake/profile")
async def get_earthquake_profile(body: EarthquakeQueryIn):
    """Returns BIS IS 1893:2016 seismic profile and historical earthquake intelligence for a location."""
    location_data = await ml_engine.predict_for_location_query(
        query=body.query or "",
        lat=body.latitude,
        lon=body.longitude,
    )
    seismic = location_data.get("seismic_richter_profile", {})
    loc = location_data.get("location", {})
    return {
        "location": loc.get("name", body.query),
        "state": loc.get("state", ""),
        "latitude": loc.get("latitude", body.latitude),
        "longitude": loc.get("longitude", body.longitude),
        "seismic_profile": seismic,
        "co_seismic_landslide_risk": seismic.get("co_seismic_landslide_risk", "Moderate"),
        "disclaimer": (
            "Exact earthquake prediction is scientifically impossible. "
            "Seismic zone classification follows BIS IS 1893:2016 and reflects "
            "historical frequency and ground motion parameters, not a guarantee of future events."
        ),
        "richter_tiers": seismic.get("richter_scale_tiers", []),
        "data_source": "BIS IS 1893:2016 · USGS NEIC Historical Catalogue · GSI Seismicity Map",
    }


@router.get("/ml/metrics")
def metrics():
    payload, _, _ = ml_engine.load_artifacts()
    return payload


@router.get("/ml/lithology")
def lithology():
    return list(ml_engine.LITHOLOGY_MAP.keys())


