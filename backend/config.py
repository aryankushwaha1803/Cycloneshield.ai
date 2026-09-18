import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None

    # Weather
    WEATHER_PROVIDER: str = "open-meteo"  # open-meteo, openweathermap, weatherapi
    WEATHER_API_KEY: Optional[str] = None
    WEATHER_API_BASE_URL: str = "https://api.open-meteo.com/v1"

    # Google Earth Engine
    GEE_PROJECT_ID: Optional[str] = None
    GEE_SERVICE_ACCOUNT_KEY_PATH: Optional[str] = None

    # Cyclone Provider
    CYCLONE_PROVIDER: str = "live"  # live, ibtracs

    # Database
    DATABASE_URL: str = "sqlite:///./cycloneshield.db"

    # Alerts & SMS
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    SMS_PROVIDER_URL: Optional[str] = None
    SMS_PROVIDER_API_KEY: Optional[str] = None

    # Risk Engine Weights
    RISK_WEIGHT_SURGE: float = 0.25
    RISK_WEIGHT_WIND: float = 0.20
    RISK_WEIGHT_RAIN: float = 0.20
    RISK_WEIGHT_INFRA: float = 0.20
    RISK_WEIGHT_EXPOSURE: float = 0.15

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
