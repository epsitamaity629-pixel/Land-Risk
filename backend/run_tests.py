import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import tests.test_multi_hazard as t
import tests.test_universal_location_search as u

if __name__ == "__main__":
    print("Running gazetteer test...")
    t.test_gazetteer_search()
    print("Running dual hazard prediction test...")
    t.test_dual_hazard_prediction()
    print("Running location query test with live meteorology...")
    t.test_location_query_prediction()
    print("\nRunning universal geocoding test...")
    u.test_universal_geocoding()
    print("Running DEM elevation & slope test...")
    u.test_elevation_and_slope_engine()
    print("Running dual hazard prediction for varied locations...")
    u.test_dual_hazard_for_any_location()
    print("\n=======================================================")
    print(">>> ALL MULTI-HAZARD & UNIVERSAL TESTS PASSED (100%) <<<")
    print("=======================================================")
