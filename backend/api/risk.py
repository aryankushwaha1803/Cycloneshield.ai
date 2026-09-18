from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import RiskCalculationResponse, RiskSimulateRequest
from services.cyclone_service import cyclone_service
from services.weather_service import weather_service
from services.infrastructure_service import infrastructure_service
from services.risk_engine import risk_engine

router = APIRouter(prefix="/risk", tags=["Deterministic Risk & Surge Engine"])

@router.post("/calculate", response_model=RiskCalculationResponse)
async def calculate_risk(db: Session = Depends(get_db)):
    """
    Executes the transparent deterministic multi-hazard risk engine using real cyclone
    track metrics, live weather observations, and OpenStreetMap infrastructure exposure.
    Formula: Risk = 0.25*Surge + 0.20*Wind + 0.20*Rain + 0.20*Infra + 0.15*Exposure.
    """
    cyclone = await cyclone_service.get_current_cyclone()
    curr = cyclone.current_position

    # Fetch real live weather at the storm position
    weather = await weather_service.get_current_weather(curr.latitude, curr.longitude)

    # Fetch infrastructure assets
    infrastructure = infrastructure_service.get_all_infrastructure(db)

    # Run deterministic risk engine
    calculation = risk_engine.calculate_deterministic_risk(cyclone, weather, infrastructure)
    return calculation

@router.post("/simulate", response_model=RiskCalculationResponse)
async def simulate_risk_scenario(
    request: RiskSimulateRequest,
    db: Session = Depends(get_db)
):
    """
    Runs a deterministic 'What-If' sensitivity analysis (e.g. +20 km/h wind, +1.0m surge override).
    """
    cyclone = cyclone_service.ibtracs_provider.get_storm_data(request.storm_id)
    if not cyclone:
        cyclone = await cyclone_service.get_current_cyclone()

    # Modify cyclone copy with deltas
    curr = cyclone.current_position
    curr.wind_speed_kmh = max(30.0, curr.wind_speed_kmh + request.wind_speed_delta_kmh)
    curr.pressure_hpa = min(1013.0, max(880.0, curr.pressure_hpa + request.pressure_delta_hpa))

    weather = await weather_service.get_current_weather(curr.latitude, curr.longitude)
    weather.rainfall_mm_24h = max(0.0, weather.rainfall_mm_24h * request.rainfall_multiplier)

    infrastructure = infrastructure_service.get_all_infrastructure(db)

    return risk_engine.calculate_deterministic_risk(
        cyclone, weather, infrastructure, surge_override_m=request.surge_height_override_m
    )
