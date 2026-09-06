"""NER Multi-Hazard Geotechnical & Hydrological ML Engine.
Trains, persists, explains, and scores both Landslide Susceptibility and Flood Inundation risks,
as well as compound cascading disaster scenarios.
"""

from __future__ import annotations

import os
import math
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

import weather_service

ARTIFACT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml_artifacts")
LANDSLIDE_MODEL_PATH = os.path.join(ARTIFACT_DIR, "best_landslide_model.joblib")
FLOOD_MODEL_PATH = os.path.join(ARTIFACT_DIR, "best_flood_model.joblib")
METRICS_PATH = os.path.join(ARTIFACT_DIR, "multi_hazard_metrics.joblib")

# Backward compatibility alias
MODEL_PATH = LANDSLIDE_MODEL_PATH

LANDSLIDE_FEATURE_COLS = [
    "slope_deg",
    "rainfall_24h_mm",
    "rainfall_7d_mm",
    "soil_moisture_pct",
    "pore_pressure_kpa",
    "elevation_m",
    "lithology_code",
    "displacement_mm",
    "tilt_deg",
]

FLOOD_FEATURE_COLS = [
    "elevation_m",
    "slope_deg",
    "rainfall_24h_mm",
    "rainfall_7d_mm",
    "soil_moisture_pct",
    "distance_to_river_m",
    "river_basin_elevation_diff_m",
    "drainage_density_km_km2",
    "catchment_rainfall_48h_mm",
]

LITHOLOGY_MAP = {
    "weathered_shale": 0,
    "sandstone": 1,
    "alluvium": 2,
    "gneiss": 3,
    "limestone": 4,
    "laterite": 5,
    "phyllite": 6,
}


def lithology_code(name: str) -> int:
    return LITHOLOGY_MAP.get(str(name).lower().replace(" ", "_"), 0)


# ==========================================
# 1. LANDSLIDE TRAINING & DATASET GENERATION
# ==========================================
def generate_landslide_dataset(n: int = 1500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    slope = rng.uniform(10, 65, n)
    rain24 = rng.gamma(2.2, 28, n).clip(0, 350)
    rain7 = (rain24 * rng.uniform(2.2, 5.5, n) + rng.uniform(20, 180, n)).clip(0, 900)
    moisture = (35 + rain24 * 0.12 + slope * 0.15 + rng.normal(0, 8, n)).clip(8, 98)
    pore = (8 + moisture * 0.35 + rain24 * 0.08 + rng.normal(0, 4, n)).clip(2, 90)
    elev = rng.uniform(40, 4200, n)
    lith = rng.integers(0, len(LITHOLOGY_MAP), n)
    disp = rng.gamma(1.4, 3.2, n).clip(0, 80)
    tilt = rng.gamma(1.2, 0.7, n).clip(0, 12)

    # Geotechnical failure logit for NER slopes
    logit = (
        -6.2
        + 0.07 * slope
        + 0.012 * rain24
        + 0.004 * rain7
        + 0.025 * moisture
        + 0.04 * pore
        + 0.08 * disp
        + 0.18 * tilt
        + 0.15 * (lith == 0)
        + 0.12 * (lith == 6)
        - 0.00025 * elev
    )
    p = 1 / (1 + np.exp(-logit))
    y = (rng.uniform(0, 1, n) < p).astype(int)

    return pd.DataFrame(
        {
            "slope_deg": slope,
            "rainfall_24h_mm": rain24,
            "rainfall_7d_mm": rain7,
            "soil_moisture_pct": moisture,
            "pore_pressure_kpa": pore,
            "elevation_m": elev,
            "lithology_code": lith,
            "displacement_mm": disp,
            "tilt_deg": tilt,
            "landslide": y,
        }
    )


# ======================================
# 2. FLOOD TRAINING & DATASET GENERATION
# ======================================
def generate_flood_dataset(n: int = 1500, seed: int = 101) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    elev = rng.uniform(15, 2200, n)
    slope = rng.uniform(0.5, 45, n)
    rain24 = rng.gamma(2.4, 32, n).clip(0, 400)
    rain7 = (rain24 * rng.uniform(2.5, 6.0, n) + rng.uniform(30, 200, n)).clip(0, 1000)
    moisture = (40 + rain24 * 0.15 + rng.normal(0, 7, n)).clip(10, 99)
    dist_river = rng.exponential(1200, n).clip(50, 15000)
    elev_diff = rng.uniform(0.5, 80, n)
    drainage = rng.uniform(0.5, 6.5, n)
    catchment_48h = (rain24 * rng.uniform(1.8, 3.2, n) + rng.uniform(10, 150, n)).clip(0, 600)

    # Hydrological flood occurrence logit
    # Low slope + low elevation + high catchment rainfall + high soil saturation + proximity to river = High Flood Risk
    logit = (
        -3.5
        - 0.09 * slope
        - 0.0012 * elev
        + 0.015 * rain24
        + 0.008 * catchment_48h
        + 0.035 * moisture
        - 0.0006 * dist_river
        - 0.045 * elev_diff
        + 0.22 * drainage
    )
    p = 1 / (1 + np.exp(-logit))
    y = (rng.uniform(0, 1, n) < p).astype(int)

    return pd.DataFrame(
        {
            "elevation_m": elev,
            "slope_deg": slope,
            "rainfall_24h_mm": rain24,
            "rainfall_7d_mm": rain7,
            "soil_moisture_pct": moisture,
            "distance_to_river_m": dist_river,
            "river_basin_elevation_diff_m": elev_diff,
            "drainage_density_km_km2": drainage,
            "catchment_rainfall_48h_mm": catchment_48h,
            "flood": y,
        }
    )


def _metrics(y_true, y_pred, y_prob) -> dict:
    cm = confusion_matrix(y_true, y_pred).tolist()
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "confusion_matrix": cm,
        "roc_curve": {"fpr": fpr.tolist()[:: max(1, len(fpr) // 40)], "tpr": tpr.tolist()[:: max(1, len(tpr) // 40)]},
    }


def _feature_importances(model, feature_cols: list[str]) -> list[dict]:
    est = model.named_steps["clf"] if isinstance(model, Pipeline) else model
    if hasattr(est, "feature_importances_"):
        vals = np.array(est.feature_importances_, dtype=float)
    elif hasattr(est, "coef_"):
        vals = np.abs(est.coef_[0])
    else:
        vals = np.ones(len(feature_cols))
    vals = vals / vals.sum() if vals.sum() else vals
    return [{"feature": f, "importance": float(v)} for f, v in zip(feature_cols, vals)]


def train_and_persist() -> dict:
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    # 1. Train Landslide AI
    df_ls = generate_landslide_dataset()
    X_ls = df_ls[LANDSLIDE_FEATURE_COLS]
    y_ls = df_ls["landslide"]
    X_train_ls, X_test_ls, y_train_ls, y_test_ls = train_test_split(X_ls, y_ls, test_size=0.25, random_state=7, stratify=y_ls)

    ls_candidates = {
        "Random Forest": RandomForestClassifier(n_estimators=180, max_depth=12, random_state=7),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=140, max_depth=3, random_state=7),
        "Extra Trees": ExtraTreesClassifier(n_estimators=180, max_depth=12, random_state=7),
        "Logistic Regression": Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression(max_iter=400, random_state=7))]),
    }

    ls_leaderboard = []
    best_ls_name, best_ls_auc, best_ls_model = None, -1, None
    for name, model in ls_candidates.items():
        model.fit(X_train_ls, y_train_ls)
        prob = model.predict_proba(X_test_ls)[:, 1] if hasattr(model, "predict_proba") else model.predict(X_test_ls).astype(float)
        pred = (prob >= 0.5).astype(int)
        m = _metrics(y_test_ls, pred, prob)
        m["name"] = name
        ls_leaderboard.append(m)
        if m["roc_auc"] > best_ls_auc:
            best_ls_auc, best_ls_name, best_ls_model = m["roc_auc"], name, model

    # 2. Train Flood AI
    df_fl = generate_flood_dataset()
    X_fl = df_fl[FLOOD_FEATURE_COLS]
    y_fl = df_fl["flood"]
    X_train_fl, X_test_fl, y_train_fl, y_test_fl = train_test_split(X_fl, y_fl, test_size=0.25, random_state=101, stratify=y_fl)

    fl_candidates = {
        "Gradient Boosting (Hydrological)": GradientBoostingClassifier(n_estimators=160, max_depth=4, random_state=101),
        "Random Forest (Hydro)": RandomForestClassifier(n_estimators=180, max_depth=12, random_state=101),
        "Extra Trees (Inundation)": ExtraTreesClassifier(n_estimators=180, max_depth=12, random_state=101),
        "Logistic Regression (Hydro)": Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression(max_iter=400, random_state=101))]),
    }

    fl_leaderboard = []
    best_fl_name, best_fl_auc, best_fl_model = None, -1, None
    for name, model in fl_candidates.items():
        model.fit(X_train_fl, y_train_fl)
        prob = model.predict_proba(X_test_fl)[:, 1] if hasattr(model, "predict_proba") else model.predict(X_test_fl).astype(float)
        pred = (prob >= 0.5).astype(int)
        m = _metrics(y_test_fl, pred, prob)
        m["name"] = name
        fl_leaderboard.append(m)
        if m["roc_auc"] > best_fl_auc:
            best_fl_auc, best_fl_name, best_fl_model = m["roc_auc"], name, model

    ls_importances = _feature_importances(best_ls_model, LANDSLIDE_FEATURE_COLS)
    fl_importances = _feature_importances(best_fl_model, FLOOD_FEATURE_COLS)

    payload = {
        "best_model_name": best_ls_name,
        "best_flood_model_name": best_fl_name,
        "leaderboard": sorted(ls_leaderboard, key=lambda x: x["roc_auc"], reverse=True),
        "flood_leaderboard": sorted(fl_leaderboard, key=lambda x: x["roc_auc"], reverse=True),
        "feature_importances": ls_importances,
        "flood_feature_importances": fl_importances,
        "feature_cols": LANDSLIDE_FEATURE_COLS,
        "flood_feature_cols": FLOOD_FEATURE_COLS,
    }

    joblib.dump(best_ls_model, LANDSLIDE_MODEL_PATH)
    joblib.dump(best_fl_model, FLOOD_MODEL_PATH)
    joblib.dump(payload, METRICS_PATH)
    return payload


def load_artifacts():
    if (
        not os.path.exists(LANDSLIDE_MODEL_PATH)
        or not os.path.exists(FLOOD_MODEL_PATH)
        or not os.path.exists(METRICS_PATH)
    ):
        train_and_persist()
    return joblib.load(METRICS_PATH), joblib.load(LANDSLIDE_MODEL_PATH), joblib.load(FLOOD_MODEL_PATH)


# ======================================
# 3. EXPLAINABILITY & DYNAMIC SCORING
# ======================================
def explain_landslide_factors(features: dict, importances: list[dict]) -> list[dict]:
    intensity = {
        "slope_deg": min(features["slope_deg"] / 65, 1),
        "rainfall_24h_mm": min(features["rainfall_24h_mm"] / 250, 1),
        "rainfall_7d_mm": min(features["rainfall_7d_mm"] / 600, 1),
        "soil_moisture_pct": min(features["soil_moisture_pct"] / 100, 1),
        "pore_pressure_kpa": min(features["pore_pressure_kpa"] / 70, 1),
        "elevation_m": min(features["elevation_m"] / 4000, 1),
        "lithology_code": 0.55 if features["lithology_code"] in (0, 6) else 0.25,
        "displacement_mm": min(features["displacement_mm"] / 25, 1),
        "tilt_deg": min(features["tilt_deg"] / 8, 1),
    }
    raw = []
    for item in importances:
        w = item["importance"] * (0.15 + intensity.get(item["feature"], 0.3))
        raw.append((item["feature"], w))
    total = sum(v for _, v in raw) or 1
    labels = {
        "slope_deg": "Slope Steepness",
        "rainfall_24h_mm": "24h Rainfall Intensity",
        "rainfall_7d_mm": "7-Day Antecedent Rain",
        "soil_moisture_pct": "Soil Saturation",
        "pore_pressure_kpa": "Pore-Water Pressure",
        "elevation_m": "Relief & Elevation",
        "lithology_code": "Geological Formation",
        "displacement_mm": "Ground Creep / Displacement",
        "tilt_deg": "Inclinometer Tilt",
    }
    return [
        {"factor": labels.get(k, k), "feature": k, "contribution_pct": round(100 * v / total, 2)}
        for k, v in raw
    ]


def explain_flood_factors(features: dict, importances: list[dict]) -> list[dict]:
    intensity = {
        "elevation_m": max(0, 1.0 - features["elevation_m"] / 600.0),
        "slope_deg": max(0, 1.0 - features["slope_deg"] / 25.0),
        "rainfall_24h_mm": min(features["rainfall_24h_mm"] / 200.0, 1.0),
        "rainfall_7d_mm": min(features["rainfall_7d_mm"] / 500.0, 1.0),
        "soil_moisture_pct": min(features["soil_moisture_pct"] / 100.0, 1.0),
        "distance_to_river_m": max(0, 1.0 - features["distance_to_river_m"] / 4000.0),
        "river_basin_elevation_diff_m": max(0, 1.0 - features["river_basin_elevation_diff_m"] / 20.0),
        "drainage_density_km_km2": min(features["drainage_density_km_km2"] / 5.0, 1.0),
        "catchment_rainfall_48h_mm": min(features["catchment_rainfall_48h_mm"] / 300.0, 1.0),
    }
    raw = []
    for item in importances:
        w = item["importance"] * (0.15 + intensity.get(item["feature"], 0.3))
        raw.append((item["feature"], w))
    total = sum(v for _, v in raw) or 1
    labels = {
        "elevation_m": "Lowland Basin / Depression",
        "slope_deg": "Flat Terrain Inundation",
        "rainfall_24h_mm": "Local 24h Cloudburst/Rain",
        "rainfall_7d_mm": "7-Day Basin Accumulation",
        "soil_moisture_pct": "Soil Infiltration Saturation",
        "distance_to_river_m": "River Bank Proximity",
        "river_basin_elevation_diff_m": "River Stage Delta",
        "drainage_density_km_km2": "Basin Drainage Density",
        "catchment_rainfall_48h_mm": "Upstream Catchment Inflow",
    }
    return [
        {"factor": labels.get(k, k), "feature": k, "contribution_pct": round(100 * v / total, 2)}
        for k, v in raw
    ]


def dynamic_risk_score(probability: float, velocity_mm_h: float, rain24: float, rain_threshold: float, slope: float) -> float:
    rain_breach = max(0.0, (rain24 - rain_threshold * 0.6) / max(rain_threshold, 1))
    vel_term = min(velocity_mm_h / 8.0, 1.0)
    slope_term = min(max(slope - 20, 0) / 45.0, 1.0)
    score = 100 * (0.52 * probability + 0.22 * vel_term + 0.16 * min(rain_breach, 1.5) / 1.5 + 0.10 * slope_term)
    return float(np.clip(score, 0, 100))


def dynamic_flood_score(probability: float, rain24: float, dist_river_m: float, slope: float, moisture: float) -> float:
    # High score if high prob, high rain, low slope, high moisture, close to river
    river_term = max(0.0, 1.0 - (dist_river_m / 3500.0))
    flat_term = max(0.0, 1.0 - (slope / 20.0))
    rain_term = min(rain24 / 150.0, 1.0)
    moist_term = min(moisture / 95.0, 1.0)
    score = 100 * (0.50 * probability + 0.20 * river_term + 0.15 * rain_term + 0.15 * (0.5 * flat_term + 0.5 * moist_term))
    return float(np.clip(score, 0, 100))


def risk_level(score: float) -> str:
    if score >= 80:
        return "Emergency"
    if score >= 60:
        return "Warning"
    if score >= 40:
        return "Advisory"
    return "Info"


def flood_level(score: float) -> str:
    if score >= 80:
        return "Severe Inundation"
    if score >= 60:
        return "Danger Flood Level"
    if score >= 40:
        return "Warning / Waterlogging"
    if score >= 20:
        return "Advisory / Alert"
    return "Normal Stage"


# ======================================
# 4. PREDICTION RUNNERS
# ======================================
def predict_from_dict(payload: dict) -> dict:
    """Predicts landslide risk from geotechnical parameters (backward-compatible)."""
    metrics, ls_model, _ = load_artifacts()
    features = {
        "slope_deg": float(payload.get("slope_deg", 32)),
        "rainfall_24h_mm": float(payload.get("rainfall_24h_mm", 40)),
        "rainfall_7d_mm": float(payload.get("rainfall_7d_mm", 140)),
        "soil_moisture_pct": float(payload.get("soil_moisture_pct", 48)),
        "pore_pressure_kpa": float(payload.get("pore_pressure_kpa", 22)),
        "elevation_m": float(payload.get("elevation_m", 900)),
        "lithology_code": lithology_code(payload.get("lithology", "weathered_shale"))
        if isinstance(payload.get("lithology"), str)
        else float(payload.get("lithology_code", 0)),
        "displacement_mm": float(payload.get("displacement_mm", 2.4)),
        "tilt_deg": float(payload.get("tilt_deg", 0.8)),
    }
    row = pd.DataFrame([features])[LANDSLIDE_FEATURE_COLS]
    proba = float(ls_model.predict_proba(row)[0, 1])
    velocity = float(payload.get("velocity_mm_h", features["displacement_mm"] / 6))
    rain_thr = float(payload.get("rainfall_threshold_mm", 120))
    score = dynamic_risk_score(proba, velocity, features["rainfall_24h_mm"], rain_thr, features["slope_deg"])
    return {
        "probability": round(proba, 4),
        "risk_score": round(score, 2),
        "risk_level": risk_level(score),
        "features": features,
        "explainability": explain_landslide_factors(features, metrics["feature_importances"]),
        "model_used": metrics["best_model_name"],
    }


def predict_multi_hazard(payload: dict) -> dict:
    """Predicts both Landslide and Flood risk, plus compound cascading disaster scores."""
    metrics, ls_model, fl_model = load_artifacts()

    slope = float(payload.get("slope_deg", 28))
    rain24 = float(payload.get("rainfall_24h_mm", 55))
    rain7 = float(payload.get("rainfall_7d_mm", 180))
    moisture = float(payload.get("soil_moisture_pct", 65))
    pore = float(payload.get("pore_pressure_kpa", 28))
    elev = float(payload.get("elevation_m", 650))
    lith = lithology_code(payload.get("lithology", "weathered_shale")) if isinstance(payload.get("lithology"), str) else float(payload.get("lithology_code", 0))
    disp = float(payload.get("displacement_mm", 3.2))
    tilt = float(payload.get("tilt_deg", 1.1))

    dist_river = float(payload.get("distance_to_river_m", 1200))
    elev_diff = float(payload.get("river_basin_elevation_diff_m", max(1.0, elev * 0.08)))
    drainage = float(payload.get("drainage_density_km_km2", 2.8))
    catchment_48h = float(payload.get("catchment_rainfall_48h_mm", rain24 * 2.2))

    # 1. Landslide Model Inference
    ls_features = {
        "slope_deg": slope,
        "rainfall_24h_mm": rain24,
        "rainfall_7d_mm": rain7,
        "soil_moisture_pct": moisture,
        "pore_pressure_kpa": pore,
        "elevation_m": elev,
        "lithology_code": lith,
        "displacement_mm": disp,
        "tilt_deg": tilt,
    }
    row_ls = pd.DataFrame([ls_features])[LANDSLIDE_FEATURE_COLS]
    ls_proba = float(ls_model.predict_proba(row_ls)[0, 1])
    velocity = float(payload.get("velocity_mm_h", disp / 4.0))
    ls_score = dynamic_risk_score(ls_proba, velocity, rain24, 120.0, slope)

    # 2. Flood Model Inference
    fl_features = {
        "elevation_m": elev,
        "slope_deg": slope,
        "rainfall_24h_mm": rain24,
        "rainfall_7d_mm": rain7,
        "soil_moisture_pct": moisture,
        "distance_to_river_m": dist_river,
        "river_basin_elevation_diff_m": elev_diff,
        "drainage_density_km_km2": drainage,
        "catchment_rainfall_48h_mm": catchment_48h,
    }
    row_fl = pd.DataFrame([fl_features])[FLOOD_FEATURE_COLS]
    fl_proba = float(fl_model.predict_proba(row_fl)[0, 1])
    fl_score = dynamic_flood_score(fl_proba, rain24, dist_river, slope, moisture)

    # 3. Compound Disaster Assessment
    # If high landslide score in steep valley near river -> Landslide Damming & GLOF/Debris Flash Flood
    compound_score = round(max(ls_score * 0.7 + fl_score * 0.3, fl_score * 0.7 + ls_score * 0.3, min(100.0, (ls_score + fl_score) * 0.65)), 1)
    
    cascading_threat = "None"
    cascading_detail = "Normal environmental baseline."
    if ls_score >= 60 and dist_river <= 2000 and slope >= 30:
        cascading_threat = "Landslide Damming & Flash Outburst Threat"
        cascading_detail = "Steep slope failure risk directly adjacent to river basin may block river channel, generating sudden upstream inundation followed by catastrophic downstream flash breach wave."
    elif fl_score >= 65 and slope <= 10:
        cascading_threat = "Widespread Plain Inundation & Embankment Erosion"
        cascading_detail = "Lowland floodplain experiencing high water table saturation and intense upstream catchment inflow. High risk of river bank breach."
    elif ls_score >= 60 and fl_score >= 50:
        cascading_threat = "Dual Compound Geo-Hydrological Emergency"
        cascading_detail = "Simultaneous hillside slips blocking transportation corridors while low-lying access roads are inundated by runoff."

    # Water surge calculation
    water_surge_m = round(max(0.0, (fl_score / 100.0) * (2.8 if elev < 300 else 1.6)), 2)
    time_to_peak_h = round(max(1.0, 18.0 - (rain24 / 25.0) - (drainage * 1.5)), 1)

    return {
        # Landslide
        "landslide": {
            "probability": round(ls_proba, 4),
            "probability_pct": round(ls_proba * 100, 1),
            "risk_score": round(ls_score, 1),
            "risk_level": risk_level(ls_score),
            "explainability": explain_landslide_factors(ls_features, metrics["feature_importances"]),
            "features": ls_features,
            "model_used": metrics["best_model_name"],
        },
        # Flood
        "flood": {
            "probability": round(fl_proba, 4),
            "probability_pct": round(fl_proba * 100, 1),
            "risk_score": round(fl_score, 1),
            "risk_level": flood_level(fl_score),
            "water_surge_m": water_surge_m,
            "time_to_peak_hours": time_to_peak_h,
            "explainability": explain_flood_factors(fl_features, metrics["flood_feature_importances"]),
            "features": fl_features,
            "model_used": metrics.get("best_flood_model_name", "Gradient Boosting (Hydrological)"),
        },
        # Compound
        "compound": {
            "risk_score": compound_score,
            "overall_threat_level": "CRITICAL" if compound_score >= 75 else "HIGH" if compound_score >= 55 else "MODERATE" if compound_score >= 35 else "LOW",
            "cascading_threat": cascading_threat,
            "cascading_detail": cascading_detail,
        }
    }


async def predict_for_location_query(query: str = "", lat: Optional[float] = None, lon: Optional[float] = None) -> dict:
    """Accepts any global/Indian location name or coordinates, fetches live weather & DEM terrain, and returns full dual prediction."""
    target_lat = lat
    target_lon = lon
    matched_place = None

    if query and (lat is None or lon is None):
        search_hits = weather_service.search_gazetteer(query, limit=5)
        if search_hits:
            matched_place = search_hits[0]
            target_lat = matched_place["lat"]
            target_lon = matched_place["lon"]
        else:
            # Fallback to geocoding directly
            live_hits = weather_service.geocode_location_live(query, limit=1)
            if live_hits:
                matched_place = live_hits[0]
                target_lat = matched_place["lat"]
                target_lon = matched_place["lon"]
            else:
                target_lat = 26.1445
                target_lon = 91.7362
                matched_place = weather_service.find_nearest_gazetteer(target_lat, target_lon)
    elif lat is not None and lon is not None:
        matched_place = weather_service.find_nearest_gazetteer(lat, lon)
    else:
        target_lat = 26.1445
        target_lon = 91.7362
        matched_place = weather_service.find_nearest_gazetteer(target_lat, target_lon)

    # Fetch live DEM elevation and topographical slope for exact coordinates
    dem_elev, dem_slope = weather_service.fetch_elevation_and_slope(target_lat, target_lon)

    # Fetch live weather for this location
    meteo = await weather_service.fetch_live_meteorology(target_lat, target_lon)

    # Assemble terrain & hydrological inputs
    elev = float(dem_elev if dem_elev is not None else matched_place.get("elevation", 450))
    slope = float(dem_slope if dem_slope is not None else matched_place.get("slope", 26))
    
    state = matched_place.get("state", "Regional") if matched_place else "Regional"
    district = matched_place.get("district", "Regional") if matched_place else "District"
    country = matched_place.get("country", "India") if matched_place else "India"
    place_name = matched_place.get("name", query or f"Coordinates ({round(target_lat, 3)}, {round(target_lon, 3)})")

    # Geomorphology enrichment for lithology and drainage
    geomorph = weather_service.infer_regional_geomorphology(target_lat, target_lon, elev, slope, state, place_name)

    river_dist_km = float(matched_place.get("river_dist_km", geomorph["river_dist_km"]))
    river_name = matched_place.get("river", geomorph["river"])
    lithology = matched_place.get("lithology", geomorph["lithology"])
    drainage_density = float(geomorph["drainage_density_km_km2"])

    input_payload = {
        "slope_deg": slope,
        "rainfall_24h_mm": meteo["rainfall_24h_mm"],
        "rainfall_7d_mm": meteo["rainfall_7d_mm"],
        "soil_moisture_pct": meteo["soil_moisture_pct"],
        "pore_pressure_kpa": round(min(80.0, 15.0 + meteo["soil_moisture_pct"] * 0.35 + meteo["rainfall_24h_mm"] * 0.12), 1),
        "elevation_m": elev,
        "lithology": lithology,
        "displacement_mm": round(max(0.6, (slope / 45.0) * 4.5 * (meteo["soil_moisture_pct"] / 80.0)), 1),
        "tilt_deg": round(max(0.2, (slope / 50.0) * 1.8), 2),
        "distance_to_river_m": river_dist_km * 1000.0,
        "river_basin_elevation_diff_m": max(1.0, 4.0 if elev < 100 else 18.0),
        "drainage_density_km_km2": drainage_density,
        "catchment_rainfall_48h_mm": round(meteo["rainfall_24h_mm"] * 2.1, 1),
    }

    prediction = predict_multi_hazard(input_payload)

    ls_score = prediction["landslide"]["risk_score"]
    fl_score = prediction["flood"]["risk_score"]
    ls_prob = prediction["landslide"]["probability_pct"]
    fl_prob = prediction["flood"]["probability_pct"]

    # Road Vulnerability Score
    road_vuln_score = round(min(100.0, max(ls_score * 0.85 + (15 if slope > 35 else 0), fl_score * 0.75 + (20 if river_dist_km < 1.0 else 0))), 1)
    
    # Population & Infrastructure Exposure
    default_exposure = geomorph.get("exposure", {
        "population": int(max(4500, int(35000 * (1.5 if elev < 300 else 0.45)))),
        "villages": int(max(2, int(12 * (1.2 if elev < 300 else 0.6)))),
        "hospitals": int(max(1, int(4 * (1.8 if elev < 300 else 0.3)))),
        "schools": int(max(3, int(18 * (1.5 if elev < 300 else 0.5)))),
        "roads_km": int(max(8, int(45 * (1.2 if elev < 300 else 0.8)))),
        "bridges": int(max(1, int(6 * (1.5 if river_dist_km < 1.5 else 0.5)))),
    })
    exposure_data = matched_place.get("exposure", default_exposure) if matched_place else default_exposure
    exposure_score = round(min(100.0, (math.log10(max(1000, exposure_data["population"])) - 3.0) * 35.0 + (exposure_data["villages"] * 1.5) + (exposure_data["roads_km"] * 0.3)), 1)

    # Multi-Hazard Overall Composite Score (0-100)
    overall_risk_score = round(min(100.0, max(ls_score, fl_score) * 0.55 + min(ls_score, fl_score) * 0.20 + road_vuln_score * 0.15 + exposure_score * 0.10), 1)

    # Emergency Priority Ranking
    if (overall_risk_score >= 70 and exposure_data["population"] >= 15000) or (ls_score >= 80 or fl_score >= 80):
        emergency_priority = {
            "level": "Priority 1 (Critical Emergency)",
            "tier": "🔴 Priority 1",
            "badge_color": "bg-red-50 text-red-700 border-red-200",
            "rationale": "High population density combined with imminent landslide or flood surge. Main transport corridor highly vulnerable to severance. Immediate dispatch of NDRF/SDRF assets recommended.",
        }
    elif overall_risk_score >= 45 or meteo["rainfall_24h_mm"] >= 65:
        emergency_priority = {
            "level": "Priority 2 (High Vigilance)",
            "tier": "🟠 Priority 2",
            "badge_color": "bg-orange-50 text-orange-700 border-orange-200",
            "rationale": "Moderate to high population exposure with significant precipitation accumulation. Continuous telemetry watch and pre-positioning of JCB earth-movers recommended.",
        }
    else:
        emergency_priority = {
            "level": "Priority 3 (Routine Monitoring)",
            "tier": "🟡 Priority 3",
            "badge_color": "bg-amber-50 text-amber-700 border-amber-200",
            "rationale": "Low to moderate exposure with baseline weather parameters. Routine IoT monitoring and community awareness active.",
        }

    # Probabilistic Forecast Windows with Confidence
    confidence_pct = int(min(94, max(68, 75 + (meteo["rainfall_24h_mm"] * 0.15) - abs(slope - 30) * 0.2)))
    
    flood_prob_24h = round(fl_prob, 1)
    flood_prob_72h = round(min(98.0, fl_prob * 1.18 + (meteo["rainfall_7d_mm"] * 0.05)), 1)
    flood_prob_7d = round(min(98.0, fl_prob * 1.30 + (meteo["rainfall_7d_mm"] * 0.08)), 1)

    ls_prob_24h = round(ls_prob, 1)
    ls_prob_72h = round(min(99.0, ls_prob * 1.15 + (meteo["soil_moisture_pct"] * 0.08)), 1)
    ls_prob_7d = round(min(99.0, ls_prob * 1.25), 1)

    # 7-Day Day-by-Day Forecast Matrix
    daily_precip = meteo.get("daily_forecast", [])
    forecast_matrix_7d = []
    for idx in range(7):
        r_mm = daily_precip[idx]["rain_mm"] if idx < len(daily_precip) else round(max(5.0, meteo["rainfall_24h_mm"] * (0.9 ** idx)), 1)
        
        # Day hazard scores
        d_ls_score = round(min(100.0, max(10.0, (slope * 1.4) + (r_mm * 0.45) + (meteo["soil_moisture_pct"] * 0.25))), 1)
        d_fl_score = round(min(100.0, max(5.0, (80 if river_dist_km < 1.0 else 25) + (r_mm * 0.55) - (slope * 0.8))), 1)

        def get_risk_badge_str(sc: float) -> str:
            if sc >= 80: return "🔴 Critical"
            if sc >= 60: return "🟠 High"
            if sc >= 40: return "🟡 Moderate"
            return "🟢 Low"

        forecast_matrix_7d.append({
            "day": f"Day {idx + 1}" if idx > 0 else "Today",
            "rainfall_mm": r_mm,
            "flood_risk": get_risk_badge_str(d_fl_score),
            "landslide_risk": get_risk_badge_str(d_ls_score),
            "flood_score": d_fl_score,
            "landslide_score": d_ls_score,
            "temp_c": round(meteo["temperature_c"] + (idx * 0.3 - 0.8), 1),
            "condition": "Heavy Rain" if r_mm >= 70 else "Scattered Showers" if r_mm >= 25 else "Partly Cloudy",
        })

    # Historical Risk Trend (2019 -> 2026)
    default_trend = [
        {"year": 2019, "risk": max(20, int(overall_risk_score * 0.72))},
        {"year": 2020, "risk": max(25, int(overall_risk_score * 0.85))},
        {"year": 2021, "risk": max(22, int(overall_risk_score * 0.78))},
        {"year": 2022, "risk": max(30, int(overall_risk_score * 0.92))},
        {"year": 2023, "risk": max(35, int(overall_risk_score * 1.05))},
        {"year": 2024, "risk": max(32, int(overall_risk_score * 1.02))},
        {"year": 2025, "risk": max(28, int(overall_risk_score * 0.96))},
        {"year": 2026, "risk": int(overall_risk_score)},
    ]
    risk_trend = matched_place.get("risk_trend", default_trend) if matched_place else default_trend

    # Natural Language AI Explanation
    top_ls_factors = prediction["landslide"]["explainability"][:2]
    top_fl_factors = prediction["flood"]["explainability"][:2]
    ai_summary_explanation = (
        f"{top_ls_factors[0]['factor']} ({top_ls_factors[0]['contribution_pct']}%) and "
        f"{top_ls_factors[1]['factor']} ({top_ls_factors[1]['contribution_pct']}%) are the primary geotechnical triggers for current landslide susceptibility. "
        f"For flood hazard, {top_fl_factors[0]['factor']} ({top_fl_factors[0]['contribution_pct']}%) is the predominant driver of river basin inundation."
    )

    # Actionable Directives & Safety
    evacuation_directives = []
    if ls_score >= 65:
        evacuation_directives.append("Halt vehicular traffic on upslope highway passes and vulnerable cut slopes.")
        evacuation_directives.append("Alert residents on steep terraces to evacuate to designated ridge-top shelters.")
    if fl_score >= 60:
        evacuation_directives.append(f"Move livestock and property to high-ground elevated platforms away from {river_name}.")
        evacuation_directives.append("Activate community early warning sirens and deploy NDRF rescue boats.")
    if not evacuation_directives:
        evacuation_directives.append("Conditions currently within normal thresholds. Continuous IoT telemetry active.")

    return {
        "location": {
            "name": place_name,
            "state": state,
            "district": district,
            "highway": matched_place.get("highway", "National Highway Corridor") if matched_place else "National Highway Corridor",
            "latitude": target_lat,
            "longitude": target_lon,
            "elevation_m": elev,
            "slope_deg": slope,
            "nearest_river": river_name,
            "river_distance_km": river_dist_km,
        },
        "live_meteorology": meteo,
        "prediction": prediction,
        "multi_hazard_scorecard": {
            "overall_risk_score": overall_risk_score,
            "overall_status": "CRITICAL" if overall_risk_score >= 75 else "HIGH" if overall_risk_score >= 55 else "MODERATE" if overall_risk_score >= 35 else "LOW",
            "flood_score": fl_score,
            "landslide_score": ls_score,
            "road_vulnerability_score": road_vuln_score,
            "population_exposure_score": exposure_score,
        },
        "probabilistic_forecast": {
            "confidence_pct": confidence_pct,
            "flood": {
                "next_24h_prob_pct": flood_prob_24h,
                "next_72h_prob_pct": flood_prob_72h,
                "next_7d_prob_pct": flood_prob_7d,
                "risk_tier": "Critical Flood Risk" if flood_prob_24h >= 75 else "High Flood Risk" if flood_prob_24h >= 55 else "Moderate Flood Risk" if flood_prob_24h >= 30 else "Low Flood Risk",
            },
            "landslide": {
                "next_24h_prob_pct": ls_prob_24h,
                "next_72h_prob_pct": ls_prob_72h,
                "next_7d_prob_pct": ls_prob_7d,
                "risk_tier": "Very High/Critical" if ls_prob_24h >= 75 else "High" if ls_prob_24h >= 55 else "Medium" if ls_prob_24h >= 35 else "Low",
            }
        },
        "exposure": exposure_data,
        "emergency_priority": emergency_priority,
        "forecast_matrix_7d": forecast_matrix_7d,
        "risk_trend": risk_trend,
        "ai_summary_explanation": ai_summary_explanation,
        "past_records": matched_place.get("past_records", []) if matched_place else [],
        "evacuation_directives": evacuation_directives,
        "early_warning_sms_template": (
            f"[NER-EWS ALERT] {place_name.upper()} ({state}): "
            f"Overall Risk {overall_risk_score}/100. "
            f"Landslide Risk {ls_score}/100 ({prediction['landslide']['risk_level']}), "
            f"Flood Threat {fl_score}/100 ({prediction['flood']['risk_level']}). "
            f"24h Rain: {meteo['rainfall_24h_mm']}mm. Directive: {evacuation_directives[0]}"
        ),
    }

