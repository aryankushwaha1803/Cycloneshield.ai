from typing import List
from fastapi import APIRouter, HTTPException
from models.schemas import CycloneResponse, HistoricalCycloneListItem, CycloneSelectRequest
from services.cyclone_service import cyclone_service

router = APIRouter(prefix="/cyclone", tags=["Cyclone Tracks & Forecasts"])

@router.get("/current", response_model=CycloneResponse)
async def get_current_cyclone():
    """
    Returns the currently active cyclone or the selected authoritative historical cyclone.
    Every track coordinate, wind speed, and pressure metric is derived from official feeds.
    """
    storm = await cyclone_service.get_current_cyclone()
    if not storm:
        raise HTTPException(status_code=404, detail="No active cyclone detected and no historical event loaded.")
    return storm

@router.get("/track", response_model=CycloneResponse)
async def get_cyclone_track():
    """
    Returns full track details: observed track history, current position,
    deterministic forecast points, forecast cone of uncertainty polygon, and quadrant wind radii.
    """
    return await cyclone_service.get_current_cyclone()

@router.get("/historical", response_model=List[HistoricalCycloneListItem])
async def list_historical_cyclones():
    """
    Catalog of verified historical cyclones from official IMD RSMC and NOAA IBTrACS archives.
    Allows testing full impact simulation even when no storm is active in the basin.
    """
    return cyclone_service.get_historical_cyclones()

@router.post("/select", response_model=CycloneResponse)
async def select_cyclone(request: CycloneSelectRequest):
    """
    Switches the active monitoring target to a specific historical or live cyclone.
    """
    storm = cyclone_service.select_cyclone(request.storm_id)
    if not storm:
        raise HTTPException(status_code=404, detail=f"Cyclone with ID '{request.storm_id}' not found in catalog.")
    return storm
