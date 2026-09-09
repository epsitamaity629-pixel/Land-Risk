from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

import ml_engine
import simulation_engine as sim
from database import get_db
from models import Alert, MonitoringLocation, RainfallRecord, Sensor, SensorReading, SystemSetting

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


class SimIn(BaseModel):
    running: bool = True
    speed: float = 1.0
    scenario: str = "monsoon"


@router.get("/state")
def state():
    return sim.get_state()


@router.post("/control")
def control(body: SimIn):
    return sim.set_running(body.running, body.speed, body.scenario)


@router.post("/tick")
def tick(db: Session = Depends(get_db)):
    """Advance one simulation step: mutate rainfall/sensors, recalc risk, maybe raise alerts."""
    st = sim.get_state()
    if not st["running"] and st["scenario"] == "idle":
        return {"ok": True, "skipped": True, "state": st}

    settings = db.query(SystemSetting).first()
    rain_thr = settings.rainfall_24h_threshold_mm if settings else 120
    created = []
    snapshot = []
    for loc in db.query(MonitoringLocation).all():
        step = sim.step_location(loc)
        rec = (
            db.query(RainfallRecord)
            .filter(RainfallRecord.location_id == loc.id)
            .order_by(RainfallRecord.timestamp.desc())
            .first()
        )
        c24 = (rec.cumulative_24h_mm if rec else 40) + step["hourly_mm"]
        c7 = (rec.cumulative_7d_mm if rec else 120) + step["hourly_mm"]
        db.add(
            RainfallRecord(
                location_id=loc.id,
                timestamp=datetime.utcnow(),
                hourly_mm=step["hourly_mm"],
                cumulative_24h_mm=round(c24, 2),
                cumulative_7d_mm=round(c7, 2),
                intensity="violent" if step["hourly_mm"] > 12 else "heavy" if step["hourly_mm"] > 6 else "moderate",
            )
        )
        pred = ml_engine.predict_from_dict(
            {
                "slope_deg": loc.slope_deg,
                "rainfall_24h_mm": c24,
                "rainfall_7d_mm": c7,
                "soil_moisture_pct": step["soil_moisture_pct"],
                "pore_pressure_kpa": step["pore_pressure_kpa"],
                "elevation_m": loc.elevation_m,
                "lithology": loc.lithology,
                "displacement_mm": step["displacement_mm"],
                "tilt_deg": step["tilt_deg"],
                "velocity_mm_h": step["velocity_mm_h"],
                "rainfall_threshold_mm": rain_thr,
            }
        )
        loc.risk_score = pred["risk_score"]
        loc.risk_level = pred["risk_level"]
        snapshot.append({"id": loc.id, "name": loc.name, **pred, "rain24": round(c24, 1)})
        if pred["risk_score"] >= 70:
            alert = Alert(
                location_id=loc.id,
                level=pred["risk_level"],
                title=f"{pred['risk_level']}: simulation pulse at {loc.name}",
                message=f"Live engine raised risk to {pred['risk_score']} (p={pred['probability']}). Rain 24h {round(c24,1)} mm.",
                risk_score=pred["risk_score"],
                probability=pred["probability"],
                recommended_actions="Activate EOCs, halt slope-side traffic, open nearest shelter.",
                channels="Web,Push",
                is_active=True,
            )
            db.add(alert)
            db.flush()
            created.append(alert.id)
        # nudge a matching sensor
        s = db.query(Sensor).filter(Sensor.location_id == loc.id, Sensor.sensor_type == "rain_gauge").first()
        if s:
            db.add(SensorReading(sensor_id=s.id, timestamp=datetime.utcnow(), value=step["hourly_mm"], unit="mm"))
    sim.decay()
    db.commit()
    return {"ok": True, "alerts_created": created, "locations": snapshot[:12], "state": sim.get_state()}
