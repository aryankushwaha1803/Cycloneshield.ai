from typing import List
from fastapi import APIRouter, Query
from models.schemas import SatelliteLayerSchema
from services.gee_service import gee_service

router = APIRouter(prefix="/satellite", tags=["Satellite & GEE Geospatial Layers"])

@router.get("/layers", response_model=List[SatelliteLayerSchema])
async def get_satellite_layers(
    lat: float = Query(23.0, description="Latitude"),
    lon: float = Query(67.9, description="Longitude")
):
    """
    Returns live satellite imagery, precipitation, and elevation layers.
    Identifies source (Google Earth Engine or NASA GIBS/Open GIS), actual dataset name,
    timestamp, and status.
    """
    return gee_service.get_satellite_layers(lat, lon)
