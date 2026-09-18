from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import AlertCreateRequest, AlertDispatchResponse
from services.alert_service import alert_service

router = APIRouter(prefix="/alerts", tags=["Early Warning & Broadcast Alerts"])

@router.get("/status")
async def get_alerts_status():
    """
    Returns the real-time configuration status of SMS and Webhook providers.
    Explicitly indicates whether alerts will be sent in LIVE mode or SIMULATION ONLY mode.
    """
    return alert_service.get_status_info()

@router.post("/dispatch", response_model=AlertDispatchResponse)
async def dispatch_alert(
    request: AlertCreateRequest,
    x_user_role: str = Header("DISASTER_AUTHORITY", alias="X-User-Role"),
    db: Session = Depends(get_db)
):
    """
    Dispatches an emergency early-warning alert across SMS or Webhooks.
    Enforces role validation: only DISASTER_AUTHORITY and ADMIN roles can dispatch.
    If external SMS keys are missing, the alert is logged in SIMULATION ONLY mode.
    """
    try:
        return await alert_service.dispatch_alert(request, db, user_role=x_user_role)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert dispatch failed: {str(e)}")

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_alert_history(db: Session = Depends(get_db)):
    """
    Returns audit trail of all issued warnings with mode, channel, provider, and timestamp.
    """
    return alert_service.get_alert_history(db)
