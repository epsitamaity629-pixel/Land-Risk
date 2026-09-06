"""In-memory live simulation engine for monsoon / tremor scenarios."""

from __future__ import annotations

import random
from datetime import datetime
from threading import Lock

STATE = {
    "running": False,
    "speed": 1.0,
    "scenario": "idle",
    "tick": 0,
    "storm_intensity": 0.0,
    "seismic": 0.0,
    "last_update": None,
}
LOCK = Lock()
SUBSCRIBERS = []


def get_state() -> dict:
    with LOCK:
        return dict(STATE)


def set_running(running: bool, speed: float | None = None, scenario: str | None = None):
    with LOCK:
        STATE["running"] = running
        if speed is not None:
            STATE["speed"] = max(0.25, min(float(speed), 8.0))
        if scenario:
            STATE["scenario"] = scenario
        if scenario == "cloudburst":
            STATE["storm_intensity"] = 1.0
        if scenario == "monsoon":
            STATE["storm_intensity"] = 0.65
        if scenario == "tremor":
            STATE["seismic"] = 1.0
        STATE["last_update"] = datetime.utcnow().isoformat()
    return get_state()


def step_location(loc, rng=None) -> dict:
    rng = rng or random
    st = get_state()
    pulse = 0.35 + 0.65 * st["storm_intensity"]
    seismic = st["seismic"]
    rain_delta = rng.uniform(0.2, 4.8) * pulse * st["speed"]
    if st["scenario"] == "cloudburst":
        rain_delta *= 3.4
    moisture = min(98, 40 + rain_delta * 4 + rng.uniform(-2, 3))
    pore = min(88, 12 + moisture * 0.28 + rain_delta * 1.1)
    tilt = 0.4 + seismic * rng.uniform(0.8, 3.2) + pulse * rng.uniform(0, 1.4)
    disp = 1.1 + seismic * rng.uniform(2, 9) + pulse * rng.uniform(0, 4)
    return {
        "hourly_mm": round(rain_delta, 2),
        "soil_moisture_pct": round(moisture, 2),
        "pore_pressure_kpa": round(pore, 2),
        "tilt_deg": round(tilt, 3),
        "displacement_mm": round(disp, 3),
        "velocity_mm_h": round(disp / 3.5 + seismic * 1.8, 3),
    }


def decay():
    with LOCK:
        STATE["tick"] += 1
        STATE["storm_intensity"] *= 0.985
        STATE["seismic"] *= 0.92
        if STATE["storm_intensity"] < 0.05:
            STATE["storm_intensity"] = 0.0
        if STATE["seismic"] < 0.05:
            STATE["seismic"] = 0.0
        STATE["last_update"] = datetime.utcnow().isoformat()
