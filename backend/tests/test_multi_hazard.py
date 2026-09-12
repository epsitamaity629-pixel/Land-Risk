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


def test_ai_disaster_report_and_simulation():
    res = asyncio.run(ml_engine.predict_for_location_query("Shillong"))
    report = ml_engine.generate_ai_disaster_intelligence_report(res)
    assert "report_id" in report
    assert "situation_summary" in report
    assert "risk_assessment" in report
    assert "early_warning" in report
    assert len(report["recommended_actions"]) > 0
    assert "disclaimer" in report["potential_impact"]

    sim = ml_engine.simulate_what_if_scenario(res, rainfall_delta_pct=50.0, soil_moisture_delta_pct=20.0)
    assert "simulated" in sim
    assert "deltas" in sim
    assert sim["simulated"]["rainfall_24h_mm"] >= sim["baseline"]["rainfall_24h_mm"]
    assert "ai_simulation_verdict" in sim


def test_ai_chat_assistant_and_comparison():
    chat_res = asyncio.run(ml_engine.chat_disaster_assistant("Is Shillong safe today?"))
    assert "reply" in chat_res
    assert len(chat_res["suggested_prompts"]) > 0

    comp = asyncio.run(ml_engine.compare_locations_data("Shillong", "Gangtok"))
    assert "location_a" in comp
    assert "location_b" in comp
    assert "verdict" in comp
    assert "comparison_metrics" in comp

    indices = ml_engine.get_regional_risk_indices()
    assert "ner_disaster_index" in indices
    assert len(indices["ner_states"]) == 8

