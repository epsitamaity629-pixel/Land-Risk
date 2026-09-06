from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Alert

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class DispatchIn(BaseModel):
    alert_id: int
    channels: list[str]


@router.get("/")
def list_alerts(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(Alert)
    if active_only:
        q = q.filter(Alert.is_active.is_(True))
    rows = q.order_by(Alert.created_at.desc()).all()
    return [_ser(a) for a in rows]


@router.post("/dispatch")
def dispatch(body: DispatchIn, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == body.alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.channels = ",".join(body.channels)
    db.commit()
    return {
        "status": "dispatched",
        "alert": a.title,
        "channels": body.channels,
        "simulated_at": datetime.utcnow().isoformat(),
        "receipts": [
            {"channel": c, "status": "sent", "detail": f"Simulated {c} fan-out to last-mile contacts"}
            for c in body.channels
        ],
    }


@router.post("/ack/{alert_id}")
def ack(alert_id: int, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.is_active = False
    db.commit()
    return {"ok": True}


def _ser(a: Alert):
    loc = a.location
    return {
        "id": a.id,
        "location_id": a.location_id,
        "location": loc.name if loc else None,
        "state": loc.state if loc else None,
        "level": a.level,
        "title": a.title,
        "message": a.message,
        "risk_score": a.risk_score,
        "probability": a.probability,
        "recommended_actions": a.recommended_actions,
        "channels": a.channels,
        "is_active": a.is_active,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
