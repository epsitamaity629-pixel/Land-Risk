import asyncio
import ml_engine
import weather_service


def test_gazetteer_search():
    results = weather_service.search_gazetteer("Guwahati")
    assert len(results) > 0
    assert results[0]["state"] == "Assam"

    results_sk = weather_service.search_gazetteer("Gangtok")
    assert len(results_sk) > 0
    assert results_sk[0]["state"] == "Sikkim"


def test_dual_hazard_prediction():
    payload = {
        "slope_deg": 38.0,
        "rainfall_24h_mm": 110.0,
        "rainfall_7d_mm": 320.0,
        "soil_moisture_pct": 78.0,
        "pore_pressure_kpa": 42.0,
        "elevation_m": 1600.0,
        "lithology": "phyllite",
        "displacement_mm": 6.5,
        "tilt_deg": 2.2,
        "distance_to_river_m": 1500.0,
        "river_basin_elevation_diff_m": 25.0,
        "drainage_density_km_km2": 2.5,
        "catchment_rainfall_48h_mm": 200.0,
    }
    pred = ml_engine.predict_multi_hazard(payload)
    assert "landslide" in pred
    assert "flood" in pred
    assert "compound" in pred
    assert 0 <= pred["landslide"]["risk_score"] <= 100
    assert 0 <= pred["flood"]["risk_score"] <= 100
    assert len(pred["landslide"]["explainability"]) > 0
    assert len(pred["flood"]["explainability"]) > 0


def test_location_query_prediction():
    res = asyncio.run(ml_engine.predict_for_location_query("Silchar"))
    assert "Silchar" in res["location"]["name"]
    assert "live_meteorology" in res
    assert "prediction" in res
    assert "past_records" in res
    assert len(res["past_records"]) > 0
    assert res["prediction"]["flood"]["risk_score"] >= 0
    assert len(res["evacuation_directives"]) > 0
