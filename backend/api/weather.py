from fastapi import APIRouter, Query, HTTPException
from models.schemas import WeatherCurrentSchema, WeatherForecastSchema
from services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Meteorological & Telemetry Feeds"])

@router.get("/current", response_model=WeatherCurrentSchema)
async def get_current_weather(
    lat: float = Query(23.0, description="Latitude"),
    lon: float = Query(67.9, description="Longitude")
):
    """
    Retrieves real live meteorological observations for the specified coordinate
    from Open-Meteo (ECMWF & GFS) or configured provider.
    Includes wind speed, wind direction, surface pressure, rainfall, temperature, and humidity.
    """
    try:
        return await weather_service.get_current_weather(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather provider request failed: {str(e)}")

@router.get("/forecast", response_model=WeatherForecastSchema)
async def get_weather_forecast(
    lat: float = Query(23.0, description="Latitude"),
    lon: float = Query(67.9, description="Longitude")
):
    """
    Retrieves 48-hour hourly weather forecast (precipitation, wind speeds, pressure).
    """
    try:
        return await weather_service.get_forecast(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather forecast request failed: {str(e)}")
