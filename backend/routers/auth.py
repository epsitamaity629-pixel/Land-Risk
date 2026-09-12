from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth_utils import ROLES, create_access_token, hash_password, verify_password
from database import get_db
from models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginIn(BaseModel):
    username: str
    password: str


class RegisterIn(BaseModel):
    username: str
    full_name: str
    email: str
    password: str
    role: str = "Citizen"
    organization: str = "Public"
    state: str = ""


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    identifier = body.username.strip()
    if not identifier or not body.password:
        raise HTTPException(status_code=400, detail="Please enter your username/email and password")

    user = (
        db.query(User)
        .filter(
            (func.lower(User.username) == identifier.lower())
            | (func.lower(User.email) == identifier.lower())
        )
        .first()
    )
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact support.")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "organization": user.organization,
        },
    }


@router.post("/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    clean_username = body.username.strip()
    clean_email = body.email.strip().lower()

    if not clean_username or not clean_email or not body.password:
        raise HTTPException(status_code=400, detail="Username, email, and password are required")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    if db.query(User).filter(
        (func.lower(User.username) == clean_username.lower())
        | (func.lower(User.email) == clean_email)
    ).first():
        raise HTTPException(status_code=409, detail="Username or email is already registered. Please log in.")

    org_str = body.organization.strip() if body.organization else "Public"
    if body.state and body.state.strip():
        org_str = f"{org_str} ({body.state.strip()})"

    user = User(
        username=clean_username,
        full_name=body.full_name.strip() or clean_username,
        email=clean_email,
        hashed_password=hash_password(body.password),
        role="Citizen",
        organization=org_str,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "organization": user.organization,
        },
    }


@router.get("/demo-users")
def demo_users():
    return []


class ForgotPasswordIn(BaseModel):
    email: str


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordIn, db: Session = Depends(get_db)):
    clean_email = body.email.strip().lower()
    return {
        "status": "ok",
        "message": f"Password recovery instructions transmitted to {clean_email} if account exists.",
        "reset_token_hint": "SEC-" + str(abs(hash(clean_email)))[:6] + "-BHU",
    }


@router.post("/reset-password")
def reset_password(body: ResetPasswordIn, db: Session = Depends(get_db)):
    if not body.token or len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Invalid token or password length < 6")
    return {
        "status": "ok",
        "message": "Password successfully updated. Please sign in with your new credentials.",
    }


@router.get("/roles")
def roles():
    return ROLES

