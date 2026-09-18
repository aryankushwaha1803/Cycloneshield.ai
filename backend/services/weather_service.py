import datetime
from typing import Dict, Any, Optional
from config import settings
from providers.weather.base import BaseWeatherProvider
from providers.weather.open_meteo import OpenMeteoWeatherProvider
from providers.weather.openweather import OpenWeatherMapProvider
from models.schemas import WeatherCurrentSchema, WeatherForecastSchema

class WeatherService:
    def __init__(self):
        self.open_meteo = OpenMeteoWeatherProvider(settings.WEATHER_API_BASE_URL)
        self.open_weather = OpenWeatherMapProvider(settings.WEATHER_API_KEY)

    def _get_active_provider(self) -> BaseWeatherProvider:
        if settings.WEATHER_PROVIDER == "openweathermap" and self.open_weather.is_configured():
            return self.open_weather
        return self.open_meteo

    async def get_current_weather(self, lat: float, lon: float) -> WeatherCurrentSchema:
        provider = self._get_active_provider()
        return await provider.get_current_weather(lat, lon)

    async def get_forecast(self, lat: float, lon: float) -> WeatherForecastSchema:
        provider = self._get_active_provider()
        return await provider.get_forecast(lat, lon)

    def get_status_info(self) -> Dict[str, Any]:
        provider = self._get_active_provider()
        return {
            "provider": provider.get_provider_name(),
            "status": "CONNECTED" if provider.is_configured() else "NOT_CONFIGURED",
            "endpoint": settings.WEATHER_API_BASE_URL if settings.WEATHER_PROVIDER == "open-meteo" else "api.openweathermap.org",
            "last_ping": datetime.datetime.utcnow().isoformat() + "Z",
            "details": "Real-time meteorological telemetry from global numerical weather prediction models (ECMWF, GFS, DWD)."
        }

weather_service = WeatherService()
