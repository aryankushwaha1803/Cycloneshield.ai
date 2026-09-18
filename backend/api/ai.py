from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import AIAnalysisRequest, AIAnalysisResponse, AdvisoryGenerateRequest
from services.cyclone_service import cyclone_service
from services.weather_service import weather_service
from services.infrastructure_service import infrastructure_service
from services.risk_engine import risk_engine
from services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["Gemini AI Disaster Intelligence"])

@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_with_gemini(
    request: AIAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Submits REAL structured cyclone, weather, surge, and infrastructure data to Google Gemini API
    to produce expert reasoning, cascade failure analysis, evacuation recommendations,
    and uncertainty assessments without hallucinating numbers.
    """
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Gemini API is NOT CONFIGURED. Provide GEMINI_API_KEY in backend/.env to run live AI reasoning."
        )

    cyclone = await cyclone_service.get_current_cyclone()
    curr = cyclone.current_position
    weather = await weather_service.get_current_weather(curr.latitude, curr.longitude)
    infrastructure = infrastructure_service.get_all_infrastructure(db)
    risk_output = risk_engine.calculate_deterministic_risk(cyclone, weather, infrastructure)

    try:
        analysis = await gemini_service.analyze_disaster_scenario(
            cyclone_data=cyclone.model_dump(),
            weather_data=weather.model_dump(),
            risk_data=risk_output.model_dump(),
            infrastructure_data=[a.model_dump() for a in infrastructure]
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API invocation error: {str(e)}")

@router.post("/advisory")
async def generate_advisory(
    request: AdvisoryGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generates tailored authority advisories for specific target groups
    (PUBLIC, COASTAL_DISTRICTS, PORT_AUTHORITIES, FIRST_RESPONDERS).
    """
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Gemini API is NOT CONFIGURED. Set GEMINI_API_KEY in backend/.env."
        )

    cyclone = await cyclone_service.get_current_cyclone()
    curr = cyclone.current_position
    weather = await weather_service.get_current_weather(curr.latitude, curr.longitude)
    infrastructure = infrastructure_service.get_all_infrastructure(db)
    risk_output = risk_engine.calculate_deterministic_risk(cyclone, weather, infrastructure)

    analysis = await gemini_service.analyze_disaster_scenario(
        cyclone_data=cyclone.model_dump(),
        weather_data=weather.model_dump(),
        risk_data=risk_output.model_dump(),
        infrastructure_data=[a.model_dump() for a in infrastructure]
    )

    return {
        "cyclone_name": cyclone.name,
        "target_audience": request.target_audience,
        "advisory": analysis.early_warning_advisory,
        "evacuation_priorities": analysis.evacuation_priorities,
        "preparedness_actions": analysis.recommended_preparedness_actions,
        "timestamp": analysis.timestamp
    }

@router.post("/multimodal")
async def analyze_multimodal_satellite(
    file: UploadFile = File(...),
    context: str = Form("Satellite observation of cyclone landfall corridor")
):
    """
    Accepts geospatial map or satellite image snapshots for multimodal AI analysis via Gemini.
    """
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Gemini API is NOT CONFIGURED. Provide GEMINI_API_KEY in backend/.env."
        )

    content = await file.read()
    mime = file.content_type or "image/jpeg"
    return await gemini_service.analyze_multimodal_image(content, mime, context)
