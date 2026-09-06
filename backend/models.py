from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    full_name = Column(String(160), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(48), default="Citizen", index=True)
    organization = Column(String(160), default="Public")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MonitoringLocation(Base):
    __tablename__ = "monitoring_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    state = Column(String(80), nullable=False, index=True)
    district = Column(String(120), nullable=False, index=True)
    highway = Column(String(80), default="")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=0)
    slope_deg = Column(Float, default=25)
    lithology = Column(String(80), default="weathered_shale")
    risk_score = Column(Float, default=35)
    risk_level = Column(String(32), default="Advisory")
    population_exposed = Column(Integer, default=0)
    notes = Column(Text, default="")

    sensors = relationship("Sensor", back_populates="location")
    rainfall = relationship("RainfallRecord", back_populates="location")
    alerts = relationship("Alert", back_populates="location")


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("monitoring_locations.id"), nullable=False)
    sensor_code = Column(String(64), unique=True, index=True)
    sensor_type = Column(String(64), nullable=False)
    status = Column(String(32), default="online")
    battery_pct = Column(Float, default=92)
    last_calibrated = Column(String(32), default="2026-03-12")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    location = relationship("MonitoringLocation", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(24), default="")
    quality = Column(String(24), default="good")

    sensor = relationship("Sensor", back_populates="readings")


class RainfallRecord(Base):
    __tablename__ = "rainfall_records"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("monitoring_locations.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    hourly_mm = Column(Float, default=0)
    cumulative_24h_mm = Column(Float, default=0)
    cumulative_7d_mm = Column(Float, default=0)
    intensity = Column(String(32), default="light")

    location = relationship("MonitoringLocation", back_populates="rainfall")


class HistoricalLandslide(Base):
    __tablename__ = "historical_landslides"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    state = Column(String(80), nullable=False, index=True)
    district = Column(String(120), nullable=False)
    year = Column(Integer, index=True)
    event_date = Column(String(32), default="")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    casualties = Column(Integer, default=0)
    infrastructure_damage = Column(Text, default="")
    trigger_cause = Column(String(160), default="intense rainfall")
    geological_formation = Column(String(160), default="")
    severity = Column(String(32), default="High")
    notes = Column(Text, default="")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("monitoring_locations.id"), nullable=True)
    level = Column(String(32), default="Info", index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, default="")
    risk_score = Column(Float, default=0)
    probability = Column(Float, default=0)
    recommended_actions = Column(Text, default="")
    channels = Column(String(120), default="Web")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    location = relationship("MonitoringLocation", back_populates="alerts")


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String(160), default="Anonymous")
    role = Column(String(48), default="Citizen")
    state = Column(String(80), default="")
    district = Column(String(120), default="")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(32), default="Moderate")
    description = Column(Text, default="")
    photo_path = Column(String(260), default="")
    status = Column(String(48), default="Under Review", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmergencyFacility(Base):
    __tablename__ = "emergency_facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    facility_type = Column(String(64), nullable=False)
    state = Column(String(80), nullable=False)
    district = Column(String(120), default="")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=0)
    contact = Column(String(80), default="")
    notes = Column(Text, default="")
    is_blocked = Column(Boolean, default=False)


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("monitoring_locations.id"), nullable=False)
    horizon_hours = Column(Integer, default=24)
    rainfall_mm = Column(Float, default=0)
    landslide_probability = Column(Float, default=0)
    risk_score = Column(Float, default=0)
    issued_at = Column(DateTime, default=datetime.utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    rainfall_24h_threshold_mm = Column(Float, default=120)
    rainfall_7d_threshold_mm = Column(Float, default=350)
    displacement_threshold_mm = Column(Float, default=12)
    tilt_threshold_deg = Column(Float, default=3.5)
    pore_pressure_threshold_kpa = Column(Float, default=45)


class VisitorSession(Base):
    __tablename__ = "visitor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(80), default="guest", index=True)
    full_name = Column(String(160), default="Guest Visitor")
    email = Column(String(160), default="")
    role = Column(String(48), default="Citizen")
    ip_address = Column(String(64), default="127.0.0.1")
    user_agent = Column(String(256), default="")
    current_page = Column(String(120), default="/")
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_ping = Column(DateTime, default=datetime.utcnow, index=True)
    visit_count = Column(Integer, default=1)
    is_active_session = Column(Boolean, default=True)


# Aliases for verification / migration scripts
Location = MonitoringLocation
RainfallReading = RainfallRecord
EarlyWarningAlert = Alert

