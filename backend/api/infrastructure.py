from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import InfrastructureAssetSchema
from services.infrastructure_service import infrastructure_service

router = APIRouter(prefix="/infrastructure", tags=["Critical Infrastructure Exposure"])

@router.get("", response_model=List[InfrastructureAssetSchema])
async def get_infrastructure(
    asset_type: Optional[str] = Query(None, description="Filter by hospital, shelter, bridge, power_substation"),
    min_lat: Optional[float] = Query(None),
    min_lon: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    max_lon: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns critical infrastructure assets (hospitals, cyclone shelters, bridges, power substations)
    derived from OpenStreetMap Overpass queries and persistent coastal database caches.
    """
    if min_lat is not None and min_lon is not None and max_lat is not None and max_lon is not None:
        assets = await infrastructure_service.fetch_live_overpass_infrastructure(
            min_lat, min_lon, max_lat, max_lon, db
        )
    else:
        assets = infrastructure_service.get_all_infrastructure(db)

    if asset_type:
        assets = [a for a in assets if a.asset_type.lower() == asset_type.lower()]

    return assets
