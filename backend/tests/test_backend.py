import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, Base, SessionLocal
from services.infrastructure_service import infrastructure_service
from services.risk_engine import risk_engine
from providers.cyclone.geometry import calculate_forecast_cone
from providers.cyclone.ibtracs import IBTrACSHistoricalProvider

@pytest.fixture(autouse=True, scope="session")
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        infrastructure_service.seed_infrastructure(db)
    finally:
        db.close()
    yield

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["platform"] == "CycloneShield AI"
    assert data["status"] == "OPERATIONAL"

def test_system_status():
    resp = client.get("/api/system/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "services" in data
    assert len(data["services"]) >= 6
    service_keys = [s["service_key"] for s in data["services"]]
    assert "weather" in service_keys
    assert "cyclone" in service_keys
    assert "gee" in service_keys
    assert "gemini" in service_keys

def test_system_health():
    resp = client.get("/api/system/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "database" in data
    assert "weather" in data
    assert "gee" in data

def test_historical_cyclones():
    resp = client.get("/api/cyclone/historical")
    assert resp.status_code == 200
    storms = resp.json()
    assert len(storms) >= 4
    names = [s["name"] for s in storms]
    assert any("Biparjoy" in n for n in names)
    assert any("Fani" in n for n in names)
    assert any("Ian" in n for n in names)

def test_current_cyclone_and_cone():
    resp = client.get("/api/cyclone/current")
    assert resp.status_code == 200
    storm = resp.json()
    assert "current_position" in storm
    assert storm["current_position"]["latitude"] > 0
    assert storm["current_position"]["wind_speed_kmh"] > 0
    assert "forecast_cone" in storm
    assert len(storm["forecast_cone"]["polygon_coordinates"]) > 5

def test_infrastructure_endpoint():
    resp = client.get("/api/infrastructure")
    assert resp.status_code == 200
    assets = resp.json()
    assert len(assets) > 0
    types = {a["asset_type"] for a in assets}
    assert "hospital" in types
    assert "shelter" in types

def test_deterministic_surge_calculation():
    # Test physical formula: 150 km/h wind, 960 hPa pressure
    surge = risk_engine.compute_storm_surge(wind_speed_kmh=150.0, central_pressure_hpa=960.0)
    assert surge["estimated_surge_m"] > 1.0
    assert surge["estimated_surge_m"] < 8.0
    assert surge["barometric_component_m"] > 0.4
    assert surge["affected_area_km2"] > 0
    assert surge["population_exposure"] > 0

def test_risk_calculate_endpoint():
    resp = client.post("/api/risk/calculate")
    assert resp.status_code == 200
    data = resp.json()
    assert 0.0 <= data["overall_risk_score"] <= 100.0
    assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "factor_breakdown" in data
    assert "evacuation_zones" in data
    assert len(data["evacuation_zones"]) >= 3

def test_alerts_status():
    resp = client.get("/api/alerts/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "mode" in data
    assert data["mode"] in ["LIVE", "SIMULATION ONLY"]

def test_situation_report_generation():
    resp = client.get("/api/reports/situation")
    assert resp.status_code == 200
    data = resp.json()
    assert "official_advisory" in data
    assert "meteorological_summary" in data
