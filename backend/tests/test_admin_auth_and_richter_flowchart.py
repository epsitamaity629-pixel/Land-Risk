import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import asyncio
from database import SessionLocal
from models import User
from routers.auth import register, login, RegisterIn, LoginIn
import ml_engine
import weather_service


def test_admin_and_user_role_assignment():
    db = SessionLocal()
    try:
        # 1. Login with seeded epsitamaity629@gmail.com -> Must have Admin role
        res1_login = login(LoginIn(username="epsitamaity629@gmail.com", password="password123"), db=db)
        assert res1_login["user"]["role"] == "Admin", f"Expected Admin for epsita, got {res1_login['user']['role']}"
        print("  [PASS] epsitamaity629@gmail.com verified with Admin role in login")

        # 2. Login with seeded soumyasaha205@gmail.com -> Must have Admin role
        res2_login = login(LoginIn(username="soumyasaha205@gmail.com", password="password123"), db=db)
        assert res2_login["user"]["role"] == "Admin", f"Expected Admin for soumya, got {res2_login['user']['role']}"
        print("  [PASS] soumyasaha205@gmail.com verified with Admin role in login")

        # 3. Register a new user with standard email -> Must get Citizen role
        dummy_user = db.query(User).filter(User.username == "test_citizen_user").first()
        if dummy_user:
            db.delete(dummy_user)
            db.commit()

        res3 = register(
            RegisterIn(
                username="test_citizen_user",
                full_name="Regular Citizen",
                email="regular.citizen.test@gmail.com",
                password="password123",
                role="Admin", # Attempting to claim Admin without authorized email
            ),
            db=db,
        )
        assert res3["user"]["role"] == "Citizen", f"Expected Citizen for unauthorized admin attempt, got {res3['user']['role']}"
        print("  [PASS] Standard user registration properly assigned Citizen / User panel role")

    finally:
        db.close()


def test_richter_scale_and_flowchart_pipeline():
    # Test for Darjeeling
    res = asyncio.run(ml_engine.predict_for_location_query("Darjeeling"))

    # Verify Richter Scale profile
    seismic = res.get("seismic_richter_profile")
    assert seismic is not None, "Missing seismic_richter_profile"
    assert "seismic_zone" in seismic, "Missing seismic_zone"
    assert "max_historical_richter" in seismic, "Missing max_historical_richter"
    assert "coseismic_threshold_richter" in seismic, "Missing coseismic_threshold_richter"
    assert "pga_g" in seismic, "Missing pga_g"
    print(f"  [PASS] Richter scale profile verified: {seismic['seismic_zone']}, Max: M{seismic['max_historical_richter']}")

    # Verify Categorized History (Previous Floods, Previous Landslides, Previous Land Risks)
    cat_hist = res.get("categorized_history")
    assert cat_hist is not None, "Missing categorized_history"
    assert "past_floods" in cat_hist, "Missing past_floods"
    assert "past_landslides" in cat_hist, "Missing past_landslides"
    assert "past_landrisks" in cat_hist, "Missing past_landrisks"
    print(f"  [PASS] Categorized past history verified: {len(cat_hist['past_floods'])} floods, {len(cat_hist['past_landslides'])} landslides, {len(cat_hist['past_landrisks'])} land risks")

    # Verify Cascading Flowchart
    flowchart = res.get("cascading_flowchart")
    assert flowchart is not None and len(flowchart) == 5, f"Expected 5 flowchart steps, got {len(flowchart) if flowchart else 0}"
    print(f"  [PASS] Cascading 5-stage flowchart verified: {[s['stage_name'] for s in flowchart]}")

    # Verify Upcoming Multi-Hazard Predictions
    upcoming = res.get("upcoming_predictions")
    assert upcoming is not None, "Missing upcoming_predictions"
    assert "upcoming_flood" in upcoming, "Missing upcoming_flood"
    assert "upcoming_landslide" in upcoming, "Missing upcoming_landslide"
    assert "upcoming_landrisk" in upcoming, "Missing upcoming_landrisk"
    print(f"  [PASS] Upcoming predictions verified: Flood 24h={upcoming['upcoming_flood']['prob_24h']}%, Landslide 24h={upcoming['upcoming_landslide']['prob_24h']}%, Land Risk 24h={upcoming['upcoming_landrisk']['prob_24h']}%")


if __name__ == "__main__":
    test_admin_and_user_role_assignment()
    test_richter_scale_and_flowchart_pipeline()
    print("\nAll Auth & Richter Scale/Flowchart tests passed!")
