from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from auth_utils import ROLES, hash_password
from database import get_db
from models import Alert, SystemSetting, User, VisitorSession

router = APIRouter(prefix="/api/admin", tags=["admin"])


class SettingsIn(BaseModel):
    rainfall_24h_threshold_mm: float | None = None
    rainfall_7d_threshold_mm: float | None = None
    displacement_threshold_mm: float | None = None
    tilt_threshold_deg: float | None = None
    pore_pressure_threshold_kpa: float | None = None


class RoleIn(BaseModel):
    username: str
    role: str


class CreateUserIn(BaseModel):
    username: str
    full_name: str
    email: str
    password: str
    role: str = "Citizen"
    organization: str = "Public"


class ToggleUserIn(BaseModel):
    user_id: int


class HeartbeatIn(BaseModel):
    session_id: str
    username: Optional[str] = "Guest"
    full_name: Optional[str] = "Guest Visitor"
    email: Optional[str] = ""
    role: Optional[str] = "Visitor"
    current_page: Optional[str] = "/"
    user_agent: Optional[str] = ""


class BroadcastAlertIn(BaseModel):
    title: str
    message: str
    level: str = "Warning"
    risk_score: float = 75.0
    channels: str = "Web,SMS,Cell Broadcast,Push"


@router.post("/heartbeat")
def heartbeat(body: HeartbeatIn, request: Request, db: Session = Depends(get_db)):
    """Receives ping from browser every 5-10s to track currently active live users."""
    now = datetime.utcnow()
    ip = request.client.host if request.client else "127.0.0.1"
    
    # Try forward headers for reverse proxy if available
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()

    ua = body.user_agent or request.headers.get("user-agent", "Unknown Device")[:250]

    session = db.query(VisitorSession).filter(VisitorSession.session_id == body.session_id).first()
    if not session:
        # Check if user is registered in db
        user = None
        if body.username and body.username != "Guest":
            user = db.query(User).filter(User.username == body.username).first()

        session = VisitorSession(
            session_id=body.session_id,
            user_id=user.id if user else None,
            username=body.username or "Guest",
            full_name=body.full_name or "Guest Visitor",
            email=body.email or "",
            role=body.role or "Visitor",
            ip_address=ip,
            user_agent=ua,
            current_page=body.current_page or "/",
            first_seen=now,
            last_ping=now,
            visit_count=1,
            is_active_session=True,
        )
        db.add(session)
    else:
        # Update existing session
        if body.username and body.username != "Guest":
            session.username = body.username
            session.full_name = body.full_name or session.full_name
            session.email = body.email or session.email
            session.role = body.role or session.role
            
            # Check user id
            if not session.user_id:
                u = db.query(User).filter(User.username == body.username).first()
                if u:
                    session.user_id = u.id

        session.current_page = body.current_page or session.current_page
        session.user_agent = ua or session.user_agent
        session.ip_address = ip or session.ip_address
        session.last_ping = now
        session.is_active_session = True

    db.commit()

    # Calculate current live count (active within 30 seconds)
    threshold = now - timedelta(seconds=30)
    live_count = db.query(VisitorSession).filter(VisitorSession.last_ping >= threshold).count()

    return {"ok": True, "live_online_count": max(1, live_count)}


@router.get("/live-presence")
def live_presence(db: Session = Depends(get_db)):
    """Returns currently live online users & historical visitor open logs."""
    now = datetime.utcnow()
    live_threshold = now - timedelta(seconds=30)

    # All sessions sorted by most recent activity
    all_sessions = db.query(VisitorSession).order_by(desc(VisitorSession.last_ping)).limit(100).all()

    live_sessions = []
    historical_sessions = []

    for s in all_sessions:
        is_live = s.last_ping is not None and s.last_ping >= live_threshold
        time_diff_sec = int((now - s.last_ping).total_seconds()) if s.last_ping else 9999
        
        device_type = "Desktop"
        ua_lower = (s.user_agent or "").lower()
        if "mobi" in ua_lower or "android" in ua_lower or "iphone" in ua_lower:
            device_type = "Mobile"
        elif "tablet" in ua_lower or "ipad" in ua_lower:
            device_type = "Tablet"

        record = {
            "id": s.id,
            "session_id": s.session_id,
            "username": s.username,
            "full_name": s.full_name or s.username,
            "email": s.email,
            "role": s.role or "Visitor",
            "ip_address": s.ip_address or "127.0.0.1",
            "device_type": device_type,
            "user_agent": s.user_agent,
            "current_page": s.current_page or "/",
            "first_seen": s.first_seen.strftime("%Y-%m-%d %H:%M:%S") if s.first_seen else "Just now",
            "last_ping": s.last_ping.strftime("%Y-%m-%d %H:%M:%S") if s.last_ping else "Just now",
            "seconds_ago": time_diff_sec,
            "visit_count": s.visit_count or 1,
            "is_online": is_live,
        }

        if is_live:
            live_sessions.append(record)
        historical_sessions.append(record)

    total_registered_users = db.query(User).count()
    total_unique_sessions = db.query(VisitorSession).count()

    return {
        "live_count": len(live_sessions),
        "total_visitors": max(total_unique_sessions, total_registered_users),
        "total_registered_users": total_registered_users,
        "live_users": live_sessions,
        "all_visitors": historical_sessions,
    }


@router.get("/users")
def users(db: Session = Depends(get_db)):
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "organization": u.organization,
            "is_active": u.is_active,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else "-",
        }
        for u in db.query(User).order_by(User.id.asc()).all()
    ]


@router.post("/users/create")
def create_user(body: CreateUserIn, db: Session = Depends(get_db)):
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    if db.query(User).filter((User.username == body.username) | (User.email == body.email.lower())).first():
        raise HTTPException(status_code=409, detail="Username or email already exists")
    
    u = User(
        username=body.username.strip(),
        full_name=body.full_name.strip(),
        email=body.email.strip().lower(),
        hashed_password=hash_password(body.password),
        role=body.role,
        organization=body.organization.strip() if body.organization else "Public",
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"ok": True, "user_id": u.id, "username": u.username}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.username == "admin" or u.username == "epsita":
        raise HTTPException(status_code=400, detail="Primary system administrator cannot be deleted")
    db.delete(u)
    db.commit()
    return {"ok": True, "deleted_id": user_id}


@router.post("/users/toggle-active")
def toggle_user_active(body: ToggleUserIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == body.user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_active = not u.is_active
    db.commit()
    return {"ok": True, "id": u.id, "is_active": u.is_active}


@router.post("/users/role")
def set_role(body: RoleIn, db: Session = Depends(get_db)):
    if body.role not in ROLES:
        return {"error": "invalid role"}
    u = db.query(User).filter(User.username == body.username).first()
    if not u:
        return {"error": "not found"}
    u.role = body.role
    db.commit()
    return {"ok": True, "username": u.username, "role": u.role}


@router.post("/broadcast-alert")
def broadcast_alert(body: BroadcastAlertIn, db: Session = Depends(get_db)):
    alert = Alert(
        level=body.level,
        title=body.title,
        message=body.message,
        risk_score=body.risk_score,
        probability=round(min(0.99, body.risk_score / 100), 2),
        recommended_actions="Follow local administration guidelines. Keep emergency go-bags ready.",
        channels=body.channels,
        is_active=True,
        created_at=datetime.utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"ok": True, "alert_id": alert.id, "title": alert.title}


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    s = db.query(SystemSetting).first()
    if not s:
        s = SystemSetting()
        db.add(s)
        db.commit()
        db.refresh(s)
    return {
        "rainfall_24h_threshold_mm": s.rainfall_24h_threshold_mm,
        "rainfall_7d_threshold_mm": s.rainfall_7d_threshold_mm,
        "displacement_threshold_mm": s.displacement_threshold_mm,
        "tilt_threshold_deg": s.tilt_threshold_deg,
        "pore_pressure_threshold_kpa": s.pore_pressure_threshold_kpa,
    }


@router.post("/settings")
def save_settings(body: SettingsIn, db: Session = Depends(get_db)):
    s = db.query(SystemSetting).first() or SystemSetting()
    db.add(s)
    data = body.model_dump(exclude_none=True)
    for k, v in data.items():
        setattr(s, k, v)
    db.commit()
    return get_settings(db)

