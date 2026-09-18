import datetime
import httpx
from typing import Optional
from providers.weather.base import BaseWeatherProvider
from models.schemas import WeatherCurrentSchema, WeatherForecastSchema, HourlyForecastItem

class OpenWeatherMapProvider(BaseWeatherProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"

    def get_provider_name(self) -> str:
        return "OpenWeatherMap API"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def get_current_weather(self, lat: float, lon: float) -> WeatherCurrentSchema:
        if not self.is_configured():
            raise ValueError("OpenWeatherMap API key is not configured.")

        url = f"{self.base_url}/weather"
        params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        main = data.get("main", {})
        wind = data.get("wind", {})
        rain = data.get("rain", {})

        return WeatherCurrentSchema(
            source="OpenWeatherMap API (Live Telemetry)",
            timestamp=datetime.datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            location_name=data.get("name", f"Station ({lat:.2f}, {lon:.2f})"),
            temperature_c=float(main.get("temp", 28.0)),
            wind_speed_kmh=round(float(wind.get("speed", 5.0)) * 3.6, 1),
            wind_direction_deg=float(wind.get("deg", 180.0)),
            pressure_hpa=float(main.get("pressure", 1010.0)),
            rainfall_mm_24h=float(rain.get("1h", 0.0) * 12.0),
            humidity_percent=float(main.get("humidity", 75.0))
        )

    async def get_forecast(self, lat: float, lon: float) -> WeatherForecastSchema:
        if not self.is_configured():
            raise ValueError("OpenWeatherMap API key is not configured.")

        url = f"{self.base_url}/forecast"
        params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        items = []
        for entry in data.get("list", [])[:16]:
            main = entry.get("main", {})
            wind = entry.get("wind", {})
            rain = entry.get("rain", {})
            items.append(
                HourlyForecastItem(
                    time=entry.get("dt_txt", ""),
                    temperature_c=float(main.get("temp", 25.0)),
                    wind_speed_kmh=round(float(wind.get("speed", 5.0)) * 3.6, 1),
                    precipitation_mm=float(rain.get("3h", 0.0)),
                    pressure_hpa=float(main.get("pressure", 1010.0))
                )
            )

        return WeatherForecastSchema(
            source="OpenWeatherMap API (Live Telemetry)",
            timestamp=datetime.datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            forecast_hours=items
        )
