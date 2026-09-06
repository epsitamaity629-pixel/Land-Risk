from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import ml_engine
from database import get_db
from models import EmergencyFacility, HistoricalLandslide, MonitoringLocation, Sensor
import weather_service

router = APIRouter(prefix="/api/map", tags=["map"])


def fc(features):
    return {"type": "FeatureCollection", "features": features}


def point(lon, lat, props):
    return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lon, lat]}, "properties": props}


def polygon(coords, props):
    return {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [coords]}, "properties": props}


def box(lat, lon, d=0.045):
    return [
        [lon - d, lat - d],
        [lon + d, lat - d],
        [lon + d, lat + d],
        [lon - d, lat + d],
        [lon - d, lat - d],
    ]


@router.get("/stations")
def stations(db: Session = Depends(get_db)):
    feats = [
        point(
            l.longitude,
            l.latitude,
            {
                "id": l.id,
                "name": l.name,
                "state": l.state,
                "district": l.district,
                "highway": l.highway,
                "risk_score": l.risk_score,
                "risk_level": l.risk_level,
                "slope_deg": l.slope_deg,
                "kind": "station",
            },
        )
        for l in db.query(MonitoringLocation).all()
    ]
    return fc(feats)


@router.get("/high-risk-polygons")
def high_risk(db: Session = Depends(get_db)):
    feats = []
    for l in db.query(MonitoringLocation).all():
        if l.risk_score >= 50:
            feats.append(
                polygon(
                    box(l.latitude, l.longitude, 0.04 + l.risk_score / 2000),
                    {
                        "name": l.name,
                        "risk_score": l.risk_score,
                        "risk_level": l.risk_level,
                        "kind": "hazard_zone",
                        "hazard_type": "Landslide Hazard Zone",
                    },
                )
            )
    return fc(feats)


@router.get("/flood-zones")
def flood_zones():
    """GeoJSON polygons of major flood-prone river floodplains in NER."""
    zones = [
        # Brahmaputra Major Flood Corridor (Guwahati to Dhubri)
        {
            "name": "Brahmaputra Lower Basin Inundation Zone",
            "state": "Assam",
            "risk_score": 82,
            "risk_level": "Severe Inundation",
            "river": "Brahmaputra",
            "coords": [[91.2, 26.3], [91.9, 26.2], [92.6, 26.4], [92.5, 26.0], [91.6, 25.9], [91.2, 26.3]],
        },
        # Majuli Island Flood Plain
        {
            "name": "Majuli River Island Flood Plain",
            "state": "Assam",
            "risk_score": 88,
            "risk_level": "Severe Inundation",
            "river": "Brahmaputra & Subansiri",
            "coords": [[94.0, 27.1], [94.4, 27.0], [94.5, 26.8], [94.1, 26.9], [94.0, 27.1]],
        },
        # Kaziranga Lowland Floodplain
        {
            "name": "Kaziranga Lowland Submersion Corridor",
            "state": "Assam",
            "risk_score": 76,
            "risk_level": "Danger Flood Level",
            "river": "Brahmaputra / Diphlu",
            "coords": [[93.0, 26.7], [93.5, 26.65], [93.6, 26.45], [93.1, 26.5], [93.0, 26.7]],
        },
        # Barak Valley Flood Zone (Silchar - Cachar)
        {
            "name": "Barak Valley Inundation Zone",
            "state": "Assam",
            "risk_score": 79,
            "risk_level": "Danger Flood Level",
            "river": "Barak",
            "coords": [[92.6, 24.95], [93.0, 24.9], [92.95, 24.7], [92.65, 24.75], [92.6, 24.95]],
        },
        # Teesta Lower Valley (Singtam - Rangpo)
        {
            "name": "Teesta Flash Flood Inundation Buffer",
            "state": "Sikkim / WB",
            "risk_score": 74,
            "risk_level": "Warning / Waterlogging",
            "river": "Teesta",
            "coords": [[88.45, 27.28], [88.55, 27.22], [88.52, 27.15], [88.42, 27.18], [88.45, 27.28]],
        },
        # Agartala Howrah Floodplain
        {
            "name": "Howrah River Basin Floodplain",
            "state": "Tripura",
            "risk_score": 68,
            "risk_level": "Warning / Waterlogging",
            "river": "Howrah",
            "coords": [[91.25, 23.88], [91.35, 23.85], [91.32, 23.78], [91.22, 23.80], [91.25, 23.88]],
        },
        # Imphal Valley Basin
        {
            "name": "Imphal River Drainage Inundation Basin",
            "state": "Manipur",
            "risk_score": 64,
            "risk_level": "Warning / Waterlogging",
            "river": "Imphal River",
            "coords": [[93.88, 24.88], [93.98, 24.84], [93.95, 24.74], [93.85, 24.78], [93.88, 24.88]],
        },
    ]

    feats = []
    for z in zones:
        feats.append(
            polygon(
                z["coords"],
                {
                    "name": z["name"],
                    "state": z["state"],
                    "risk_score": z["risk_score"],
                    "risk_level": z["risk_level"],
                    "river": z["river"],
                    "kind": "flood_zone",
                    "hazard_type": "Flood Inundation Zone",
                },
            )
        )
    return fc(feats)


@router.get("/inspect-coordinate")
async def inspect_coordinate(lat: float = Query(..., ge=-90.0, le=90.0), lon: float = Query(..., ge=-180.0, le=180.0)):
    """Runs instant dual Landslide + Flood AI model scoring on any arbitrary coordinate clicked on the GIS map."""
    return await ml_engine.predict_for_location_query(query="", lat=lat, lon=lon)


@router.get("/sensors")
def sensors(db: Session = Depends(get_db)):
    feats = [
        point(
            s.longitude,
            s.latitude,
            {
                "id": s.id,
                "code": s.sensor_code,
                "type": s.sensor_type,
                "status": s.status,
                "battery_pct": s.battery_pct,
                "kind": "sensor",
            },
        )
        for s in db.query(Sensor).all()
    ]
    return fc(feats)


@router.get("/facilities")
def facilities(db: Session = Depends(get_db)):
    feats = [
        point(
            f.longitude,
            f.latitude,
            {
                "id": f.id,
                "name": f.name,
                "type": f.facility_type,
                "state": f.state,
                "contact": f.contact,
                "capacity": f.capacity,
                "notes": f.notes,
                "kind": "facility",
                "is_blocked": f.is_blocked,
            },
        )
        for f in db.query(EmergencyFacility).all()
    ]
    return fc(feats)


@router.get("/history")
def history(db: Session = Depends(get_db)):
    feats = [
        point(
            h.longitude,
            h.latitude,
            {
                "id": h.id,
                "name": h.name,
                "year": h.year,
                "severity": h.severity,
                "casualties": h.casualties,
                "kind": "history",
            },
        )
        for h in db.query(HistoricalLandslide).all()
    ]
    return fc(feats)


@router.get("/evacuation-routes")
def routes(db: Session = Depends(get_db)):
    stations = db.query(MonitoringLocation).all()
    shelters = db.query(EmergencyFacility).filter(EmergencyFacility.facility_type == "shelter").all()
    lines = []
    for loc in stations:
        if loc.risk_score < 55:
            continue
        best = min(
            shelters,
            key=lambda s: (s.latitude - loc.latitude) ** 2 + (s.longitude - loc.longitude) ** 2,
            default=None,
        )
        if not best:
            continue
        lines.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[loc.longitude, loc.latitude], [best.longitude, best.latitude]],
                },
                "properties": {"from": loc.name, "to": best.name, "kind": "evacuation"},
            }
        )
    return fc(lines)
