from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import MonitoringLocation, RainfallRecord, SystemSetting

router = APIRouter(prefix="/api/rainfall", tags=["rainfall"])


@router.get("/latest")
def latest(db: Session = Depends(get_db)):
    out = []
    for loc in db.query(MonitoringLocation).all():
        rec = (
            db.query(RainfallRecord)
            .filter(RainfallRecord.location_id == loc.id)
            .order_by(RainfallRecord.timestamp.desc())
            .first()
        )
        if rec:
            out.append(
                {
                    "location_id": loc.id,
                    "name": loc.name,
                    "state": loc.state,
                    "hourly_mm": rec.hourly_mm,
                    "cumulative_24h_mm": rec.cumulative_24h_mm,
                    "cumulative_7d_mm": rec.cumulative_7d_mm,
                    "intensity": rec.intensity,
                    "timestamp": rec.timestamp.isoformat(),
                }
            )
    return out


@router.get("/series")
def series(location_id: int | None = None, hours: int = Query(168, le=240), db: Session = Depends(get_db)):
    q = db.query(RainfallRecord)
    if location_id:
        q = q.filter(RainfallRecord.location_id == location_id)
    else:
        loc = db.query(MonitoringLocation).first()
        if loc:
            q = q.filter(RainfallRecord.location_id == loc.id)
    rows = q.order_by(RainfallRecord.timestamp.desc()).limit(hours).all()[::-1]
    return [
        {
            "timestamp": r.timestamp.isoformat(),
            "hourly_mm": r.hourly_mm,
            "cumulative_24h_mm": r.cumulative_24h_mm,
            "cumulative_7d_mm": r.cumulative_7d_mm,
            "intensity": r.intensity,
        }
        for r in rows
    ]


@router.get("/thresholds")
def thresholds(db: Session = Depends(get_db)):
    s = db.query(SystemSetting).first()
    latest_rows = latest(db)
    alerts = []
    if s:
        for row in latest_rows:
            if row["cumulative_24h_mm"] >= s.rainfall_24h_threshold_mm:
                alerts.append({**row, "breach": "24h"})
            elif row["cumulative_7d_mm"] >= s.rainfall_7d_threshold_mm:
                alerts.append({**row, "breach": "7d"})
    return {"settings": _settings(s), "breaches": alerts}


def _settings(s):
    if not s:
        return {}
    return {
        "rainfall_24h_threshold_mm": s.rainfall_24h_threshold_mm,
        "rainfall_7d_threshold_mm": s.rainfall_7d_threshold_mm,
        "displacement_threshold_mm": s.displacement_threshold_mm,
        "tilt_threshold_deg": s.tilt_threshold_deg,
        "pore_pressure_threshold_kpa": s.pore_pressure_threshold_kpa,
    }
