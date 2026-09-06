from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field

# Auth schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "citizen"
    agency: Optional[str] = None
    phone: Optional[str] = None
    assigned_state: Optional[str] = None

# Prediction schemas
class PredictionRequest(BaseModel):
    rainfall_intensity: float = Field(default=25.0, description="mm/hr")
    cumulative_24h_rainfall: float = Field(default=120.0, description="mm")
    rainfall_duration_hrs: float = Field(default=18.0, description="hours")
    soil_moisture: float = Field(default=75.0, description="%")
    slope_angle: float = Field(default=42.0, description="degrees")
    elevation: float = Field(default=1400.0, description="meters")
    ground_displacement_rate: float = Field(default=8.5, description="mm/day")
    pore_water_pressure_kpa: float = Field(default=55.0, description="kPa")
    temperature: float = Field(default=22.0, description="Celsius")
    humidity: float = Field(default=88.0, description="%")
    distance_to_river: float = Field(default=350.0, description="meters")
    historical_incidents_count: int = Field(default=3, description="count")

class ContributingFactor(BaseModel):
    factor: str
    percentage: float

class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    landslide_probability: float
    contributing_factors: List[ContributingFactor]
    recommended_action: str

# Incident schemas
class IncidentCreate(BaseModel):
    reporter_name: str
    reporter_phone: Optional[str] = None
    reporter_type: str = "citizen"
    location_name: str
    state: str
    district: str
    latitude: float
    longitude: float
    phenomenon_type: str = "Slope Failure"
    severity: str = "Moderate"
    description: str
    image_url: Optional[str] = None

# Alert simulation / threshold schema
class ThresholdConfig(BaseModel):
    rainfall_warning_mm: float = 65.0
    rainfall_critical_mm: float = 120.0
    soil_moisture_critical: float = 80.0
    ground_displacement_critical_mm: float = 12.0
