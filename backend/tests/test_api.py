import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_login_issues_token():
    r = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["user"]["role"] == "Admin"


def test_login_rejects_bad_password():
    r = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


def test_predict_risk():
    r = client.post(
        "/api/predict-risk",
        json={
            "slope_deg": 48,
            "rainfall_24h_mm": 180,
            "rainfall_7d_mm": 420,
            "soil_moisture_pct": 78,
            "pore_pressure_kpa": 42,
            "elevation_m": 1400,
            "lithology": "weathered_shale",
            "displacement_mm": 9,
            "tilt_deg": 3.2,
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert 0 <= body["probability"] <= 1
    assert 0 <= body["risk_score"] <= 100
    assert body["explainability"]


def test_sensors_and_alerts():
    sensors = client.get("/api/sensors/")
    assert sensors.status_code == 200
    assert len(sensors.json()) > 0
    alerts = client.get("/api/alerts/")
    assert alerts.status_code == 200
    # seed creates alerts for high-risk sites
    assert isinstance(alerts.json(), list)
