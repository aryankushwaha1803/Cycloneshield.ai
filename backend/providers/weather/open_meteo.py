import datetime
import httpx
from typing import Dict, Any, List
from providers.weather.base import BaseWeatherProvider
from models.schemas import WeatherCurrentSchema, WeatherForecastSchema, HourlyForecastItem

class OpenMeteoWeatherProvider(BaseWeatherProvider):
    def __init__(self, base_url: str = "https://api.open-meteo.com/v1"):
        self.base_url = base_url

    def get_provider_name(self) -> str:
        return "Open-Meteo (ECMWF & GFS Models)"

    def is_configured(self) -> bool:
        return True  # Open-Meteo is publicly available with no API key requirement

    async def get_current_weather(self, lat: float, lon: float) -> WeatherCurrentSchema:
        url = f"{self.base_url}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation",
            "hourly": "precipitation",
            "forecast_days": 1,
            "wind_speed_unit": "kmh"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current", {})
        hourly = data.get("hourly", {})
        precip_list = hourly.get("precipitation", [0.0])
        rainfall_24h = sum(precip_list[:24]) if precip_list else 0.0

        return WeatherCurrentSchema(
            source="Open-Meteo (ECMWF/GFS Integration)",
            timestamp=datetime.datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            location_name=f"Coord ({lat:.2f}, {lon:.2f})",
            temperature_c=float(current.get("temperature_2m", 28.0)),
            wind_speed_kmh=float(current.get("wind_speed_10m", 25.0)),
            wind_direction_deg=float(current.get("wind_direction_10m", 180.0)),
            pressure_hpa=float(current.get("surface_pressure", 1008.0)),
            rainfall_mm_24h=round(rainfall_24h, 1),
            humidity_percent=float(current.get("relative_humidity_2m", 80.0))
        )

    async def get_forecast(self, lat: float, lon: float) -> WeatherForecastSchema:
        url = f"{self.base_url}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation",
            "forecast_days": 2,
            "wind_speed_unit": "kmh"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        winds = hourly.get("wind_speed_10m", [])
        precips = hourly.get("precipitation", [])
        pressures = hourly.get("surface_pressure", [])

        items: List[HourlyForecastItem] = []
        for i in range(min(48, len(times))):
            items.append(
                HourlyForecastItem(
                    time=times[i],
                    temperature_c=float(temps[i]) if i < len(temps) else 25.0,
                    wind_speed_kmh=float(winds[i]) if i < len(winds) else 20.0,
                    precipitation_mm=float(precips[i]) if i < len(precips) else 0.0,
                    pressure_hpa=float(pressures[i]) if i < len(pressures) else 1010.0
                )
            )

        return WeatherForecastSchema(
            source="Open-Meteo (ECMWF/GFS Integration)",
            timestamp=datetime.datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            forecast_hours=items
        )
