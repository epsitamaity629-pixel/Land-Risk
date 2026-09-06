import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from database import get_db
from models import Alert, HistoricalLandslide, MonitoringLocation, Sensor

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/executive")
def executive(db: Session = Depends(get_db)):
    locs = db.query(MonitoringLocation).all()
    alerts = db.query(Alert).filter(Alert.is_active.is_(True)).all()
    return {
        "title": "NER Landslide Early Warning — Executive Brief",
        "generated_at": datetime.utcnow().isoformat(),
        "coverage": "Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura",
        "stations": len(locs),
        "sensors": db.query(Sensor).count(),
        "active_alerts": len(alerts),
        "highest_risk": sorted(
            [{"name": l.name, "state": l.state, "score": l.risk_score, "level": l.risk_level} for l in locs],
            key=lambda x: x["score"],
            reverse=True,
        )[:8],
        "historical_catalogue": db.query(HistoricalLandslide).count(),
        "recommendations": [
            "Pre-position SDRF/NDRF near NH-10, NH-29, NH-27 and NH-37 cuttings exceeding Warning threshold.",
            "Issue last-mile SMS in local languages for Emergency polygons.",
            "Keep night closures on Jatinga / Paglajhora style ghats during >120 mm/24h rainfall.",
            "Verify citizen reports within 2 hours during active simulation / monsoon pulses.",
        ],
    }


@router.get("/export.csv")
def export_csv(db: Session = Depends(get_db)):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "name", "state", "district", "highway", "lat", "lon", "slope", "risk_score", "risk_level"])
    for l in db.query(MonitoringLocation).all():
        w.writerow([l.id, l.name, l.state, l.district, l.highway, l.latitude, l.longitude, l.slope_deg, l.risk_score, l.risk_level])
    return Response(content=buf.getvalue(), media_type="text/csv")
