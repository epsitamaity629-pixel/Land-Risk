from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import EmergencyFacility, MonitoringLocation

router = APIRouter(prefix="/api/emergency", tags=["emergency"])


@router.get("/facilities")
def facilities(facility_type: str | None = None, db: Session = Depends(get_db)):
    q = db.query(EmergencyFacility)
    if facility_type:
        q = q.filter(EmergencyFacility.facility_type == facility_type)
    return [
        {
            "id": f.id,
            "name": f.name,
            "facility_type": f.facility_type,
            "state": f.state,
            "district": f.district,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "capacity": f.capacity,
            "contact": f.contact,
            "notes": f.notes,
            "is_blocked": f.is_blocked,
        }
        for f in q.all()
    ]


@router.get("/plan")
def plan(location_id: int = Query(...), db: Session = Depends(get_db)):
    loc = db.query(MonitoringLocation).filter(MonitoringLocation.id == location_id).first()
    if not loc:
        return {"error": "location not found"}
    facs = db.query(EmergencyFacility).all()

    def dist(f):
        return (f.latitude - loc.latitude) ** 2 + (f.longitude - loc.longitude) ** 2

    shelters = sorted([f for f in facs if f.facility_type == "shelter"], key=dist)[:3]
    hospitals = sorted([f for f in facs if f.facility_type == "hospital"], key=dist)[:3]
    ndrf = sorted([f for f in facs if f.facility_type == "ndrf_base"], key=dist)[:2]
    blocked = [f for f in facs if f.is_blocked]
    return {
        "location": {"id": loc.id, "name": loc.name, "state": loc.state, "risk_level": loc.risk_level},
        "population_exposed": loc.population_exposed,
        "nearest_shelters": [_f(s) for s in shelters],
        "nearest_hospitals": [_f(s) for s in hospitals],
        "ndrf": [_f(s) for s in ndrf],
        "blocked_routes": [_f(s) for s in blocked],
        "contacts": [
            {"agency": "NDMA Helpline", "phone": "1078"},
            {"agency": "State Emergency", "phone": "1070"},
            {"agency": "Police", "phone": "112"},
            {"agency": "Fire", "phone": "101"},
        ],
    }


def _f(f: EmergencyFacility):
    return {
        "id": f.id,
        "name": f.name,
        "facility_type": f.facility_type,
        "latitude": f.latitude,
        "longitude": f.longitude,
        "contact": f.contact,
        "capacity": f.capacity,
        "notes": f.notes,
        "state": f.state,
    }
