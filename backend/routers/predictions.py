from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

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


@router.get("/ml/metrics")
def metrics():
    payload, _, _ = ml_engine.load_artifacts()
    return payload


@router.get("/ml/lithology")
def lithology():
    return list(ml_engine.LITHOLOGY_MAP.keys())

