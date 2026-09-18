from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import SituationReportResponse
from services.cyclone_service import cyclone_service
from services.weather_service import weather_service
from services.infrastructure_service import infrastructure_service
from services.risk_engine import risk_engine
from services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Situation Reports & Official Briefings"])

@router.get("/situation", response_model=SituationReportResponse)
async def get_situation_report(db: Session = Depends(get_db)):
    """
    Retrieves or generates an automated comprehensive situation report
    integrating current meteorological telemetry, modeled surge, infrastructure exposure,
    and official authority advisories.
    """
    cyclone = await cyclone_service.get_current_cyclone()
    curr = cyclone.current_position
    weather = await weather_service.get_current_weather(curr.latitude, curr.longitude)
    infrastructure = infrastructure_service.get_all_infrastructure(db)
    risk_output = risk_engine.calculate_deterministic_risk(cyclone, weather, infrastructure)

    return report_service.generate_situation_report(
        cyclone=cyclone,
        risk=risk_output,
        db=db,
        generated_by="CycloneShield AI Operations Center"
    )

@router.post("/generate", response_model=SituationReportResponse)
async def generate_new_situation_report(db: Session = Depends(get_db)):
    """
    Explicitly triggers generation of a new situation report snapshot.
    """
    return await get_situation_report(db)
