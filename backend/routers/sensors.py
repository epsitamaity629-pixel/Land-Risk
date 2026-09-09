from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Sensor, SensorReading

router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("/")
def list_sensors(db: Session = Depends(get_db)):
    out = []
    for s in db.query(Sensor).all():
        last = (
            db.query(SensorReading)
            .filter(SensorReading.sensor_id == s.id)
            .order_by(SensorReading.timestamp.desc())
            .first()
        )
        out.append(
            {
                "id": s.id,
                "location_id": s.location_id,
                "sensor_code": s.sensor_code,
                "sensor_type": s.sensor_type,
                "status": s.status,
                "battery_pct": s.battery_pct,
                "last_calibrated": s.last_calibrated,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "last_value": last.value if last else None,
                "unit": last.unit if last else "",
                "last_seen": last.timestamp.isoformat() if last else None,
            }
        )
    return out


@router.get("/{sensor_id}/readings")
def readings(sensor_id: int, limit: int = Query(48, le=200), db: Session = Depends(get_db)):
    rows = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
        .all()[::-1]
    )
    return [
        {"timestamp": r.timestamp.isoformat(), "value": r.value, "unit": r.unit, "quality": r.quality}
        for r in rows
    ]
