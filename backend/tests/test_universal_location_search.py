import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import asyncio
import weather_service
import ml_engine


def test_universal_geocoding():
    # Test across different geographies
    places = ["Shimla", "Mumbai", "Wayanad", "Kedarnath", "Darjeeling", "Kolkata", "Guwahati"]
    for place in places:
        results = weather_service.search_gazetteer(place, limit=4)
        assert len(results) > 0, f"Failed to find results for {place}"
        top = results[0]
        assert "lat" in top and "lon" in top, f"Missing coordinates for {place}"
        assert -90 <= top["lat"] <= 90
        assert -180 <= top["lon"] <= 180
        print(f"[OK] Geocoded {place}: {top['name']}, {top.get('state', '')}, {top.get('country', '')} ({top['lat']}, {top['lon']})")


def test_elevation_and_slope_engine():
    # Test Himalayan high relief vs Gangetic plains
    himalaya_elev, himalaya_slope = weather_service.fetch_elevation_and_slope(27.0360, 88.2627) # Darjeeling
    plains_elev, plains_slope = weather_service.fetch_elevation_and_slope(22.5726, 88.3639) # Kolkata

    assert himalaya_elev > 1000, "Darjeeling elevation should be > 1000m"
    assert himalaya_slope > 10, "Darjeeling slope should be steep"
    assert plains_elev < 100, "Kolkata elevation should be low"
    print(f"[OK] DEM Stencil: Darjeeling (Elev: {himalaya_elev}m, Slope: {himalaya_slope} deg), Kolkata (Elev: {plains_elev}m, Slope: {plains_slope} deg)")


def test_dual_hazard_for_any_location():
    test_queries = ["Shimla", "Mumbai", "Wayanad", "Kolkata", "Darjeeling"]
    for q in test_queries:
        res = asyncio.run(ml_engine.predict_for_location_query(q))
        assert "location" in res
        assert "multi_hazard_scorecard" in res
        assert "probabilistic_forecast" in res
        assert "forecast_matrix_7d" in res
        assert len(res["forecast_matrix_7d"]) == 7
        assert "evacuation_directives" in res
        assert "ai_summary_explanation" in res
        
        ls_score = res["multi_hazard_scorecard"]["landslide_score"]
        fl_score = res["multi_hazard_scorecard"]["flood_score"]
        overall = res["multi_hazard_scorecard"]["overall_risk_score"]

        assert 0 <= ls_score <= 100
        assert 0 <= fl_score <= 100
        assert 0 <= overall <= 100
        print(f"[OK] Prediction for {q}: LS Score = {ls_score}, Flood Score = {fl_score}, Overall = {overall} ({res['multi_hazard_scorecard']['overall_status']})")


if __name__ == "__main__":
    print("Testing universal geocoding...")
    test_universal_geocoding()
    print("\nTesting DEM slope calculation...")
    test_elevation_and_slope_engine()
    print("\nTesting dual hazard prediction across varied locations...")
    test_dual_hazard_for_any_location()
    print("\n>>> ALL UNIVERSAL LOCATION TESTS PASSED! <<<")
