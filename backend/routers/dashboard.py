from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Alert, HistoricalLandslide, MonitoringLocation, RainfallRecord, Sensor, SensorReading

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    locs = db.query(MonitoringLocation).all()
    alerts = db.query(Alert).filter(Alert.is_active.is_(True)).all()
    sensors = db.query(Sensor).all()
    levels = {"Info": 0, "Advisory": 0, "Warning": 0, "Emergency": 0}
    for loc in locs:
        levels[loc.risk_level] = levels.get(loc.risk_level, 0) + 1
    avg_risk = round(sum(l.risk_score for l in locs) / max(len(locs), 1), 1)
    online = sum(1 for s in sensors if s.status == "online")
    latest_rain = (
        db.query(RainfallRecord).order_by(RainfallRecord.timestamp.desc()).limit(len(locs) or 1).all()
    )
    rain24 = round(sum(r.cumulative_24h_mm for r in latest_rain) / max(len(latest_rain), 1), 1)
    return {
        "monitored_locations": len(locs),
        "active_alerts": len(alerts),
        "avg_risk_score": avg_risk,
        "risk_levels": levels,
        "sensors_total": len(sensors),
        "sensors_online": online,
        "historical_events": db.query(HistoricalLandslide).count(),
        "avg_rainfall_24h_mm": rain24,
        "states": 8,
        "updated_at": datetime.utcnow().isoformat(),
    }


@router.get("/risk-timeline")
def risk_timeline(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    points = []
    locs = db.query(MonitoringLocation).all()
    base = sum(l.risk_score for l in locs) / max(len(locs), 1)
    for h in range(24):
        points.append(
            {
                "hour": (now - timedelta(hours=23 - h)).strftime("%H:00"),
                "risk": round(max(12, min(95, base + (h - 12) * 1.4 + (4 if h > 18 else 0))), 1),
            }
        )
    return points


@router.get("/state-analytics")
def state_analytics(db: Session = Depends(get_db)):
    locs = db.query(MonitoringLocation).all()
    bucket = {}
    for loc in locs:
        b = bucket.setdefault(loc.state, {"state": loc.state, "stations": 0, "risk_sum": 0, "max_risk": 0, "emergency": 0})
        b["stations"] += 1
        b["risk_sum"] += loc.risk_score
        b["max_risk"] = max(b["max_risk"], loc.risk_score)
        if loc.risk_level == "Emergency":
            b["emergency"] += 1
    hist = db.query(HistoricalLandslide).all()
    hcount = {}
    for h in hist:
        hcount[h.state] = hcount.get(h.state, 0) + 1
    out = []
    for st, b in bucket.items():
        out.append(
            {
                "state": st,
                "stations": b["stations"],
                "avg_risk": round(b["risk_sum"] / b["stations"], 1),
                "max_risk": round(b["max_risk"], 1),
                "emergency_sites": b["emergency"],
                "historical_events": hcount.get(st, 0),
            }
        )
    return sorted(out, key=lambda x: x["avg_risk"], reverse=True)


@router.get("/history")
def history_table(db: Session = Depends(get_db)):
    return [
        {
            "id": h.id,
            "name": h.name,
            "state": h.state,
            "district": h.district,
            "year": h.year,
            "event_date": h.event_date,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "casualties": h.casualties,
            "infrastructure_damage": h.infrastructure_damage,
            "trigger_cause": h.trigger_cause,
            "geological_formation": h.geological_formation,
            "severity": h.severity,
            "notes": h.notes,
        }
        for h in db.query(HistoricalLandslide).order_by(HistoricalLandslide.year.desc()).all()
    ]


@router.get("/locations")
def locations(db: Session = Depends(get_db)):
    return [
        {
            "id": l.id,
            "name": l.name,
            "state": l.state,
            "district": l.district,
            "highway": l.highway,
            "latitude": l.latitude,
            "longitude": l.longitude,
            "elevation_m": l.elevation_m,
            "slope_deg": l.slope_deg,
            "lithology": l.lithology,
            "risk_score": l.risk_score,
            "risk_level": l.risk_level,
            "population_exposed": l.population_exposed,
        }
        for l in db.query(MonitoringLocation).all()
    ]
