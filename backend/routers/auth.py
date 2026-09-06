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


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    identifier = body.username.strip()
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
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact Administrator.")
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
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Choose from: {', '.join(ROLES)}")
    
    clean_username = body.username.strip()
    clean_email = body.email.strip().lower()
    
    if db.query(User).filter(
        (func.lower(User.username) == clean_username.lower())
        | (func.lower(User.email) == clean_email)
    ).first():
        raise HTTPException(status_code=409, detail="Username or email already registered")
        
    user = User(
        username=clean_username,
        full_name=body.full_name.strip(),
        email=clean_email,
        hashed_password=hash_password(body.password),
        role=body.role,
        organization=body.organization.strip() if body.organization else "Public",
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
    return [
        {
            "username": "epsita",
            "email": "epsitamaity629@gmail.com",
            "full_name": "Epsita Maity",
            "password": "password123",
            "role": "Admin",
            "label": "Epsita Maity (Admin)",
        },
        {
            "username": "sanjana",
            "email": "sanjanajana464@gmail.com",
            "full_name": "Sanjana Jana",
            "password": "password123",
            "role": "Disaster Management Authority",
            "label": "Sanjana Jana (DMA)",
        },
        {
            "username": "soumya",
            "email": "soumyasaha205@gmail.com",
            "full_name": "Soumya Saha",
            "password": "password123",
            "role": "Field Officer",
            "label": "Soumya Saha (Field Officer)",
        },
        {
            "username": "ananya",
            "email": "patraananya37@gamil.com",
            "full_name": "Ananya Patra",
            "password": "password123",
            "role": "Field Officer",
            "label": "Ananya Patra (Field Officer)",
        },
        {
            "username": "monira",
            "email": "monira.protappur@gmail.com",
            "full_name": "Monira Protappur",
            "password": "password123",
            "role": "Citizen",
            "label": "Monira Protappur (Citizen)",
        },
        {
            "username": "admin",
            "email": "admin@ner-ews.gov.in",
            "full_name": "Control Room Admin",
            "password": "admin123",
            "role": "Admin",
            "label": "Default Admin",
        },
        {
            "username": "dma",
            "email": "dma@ner-ews.gov.in",
            "full_name": "State DMA Officer",
            "password": "dma123",
            "role": "Disaster Management Authority",
            "label": "Default DMA",
        },
        {
            "username": "officer",
            "email": "officer@ner-ews.gov.in",
            "full_name": "Field Officer",
            "password": "officer123",
            "role": "Field Officer",
            "label": "Default Officer",
        },
        {
            "username": "citizen",
            "email": "citizen@ner-ews.gov.in",
            "full_name": "Community Reporter",
            "password": "citizen123",
            "role": "Citizen",
            "label": "Default Citizen",
        },
    ]


@router.get("/roles")
def roles():
    return ROLES

