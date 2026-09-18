from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models.schemas import WeatherCurrentSchema, WeatherForecastSchema

class BaseWeatherProvider(ABC):
    @abstractmethod
    def get_provider_name(self) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @abstractmethod
    async def get_current_weather(self, lat: float, lon: float) -> WeatherCurrentSchema:
        pass

    @abstractmethod
    async def get_forecast(self, lat: float, lon: float) -> WeatherForecastSchema:
        pass
