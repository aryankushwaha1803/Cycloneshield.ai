from api.system import router as system_router
from api.cyclone import router as cyclone_router
from api.weather import router as weather_router
from api.satellite import router as satellite_router
from api.infrastructure import router as infrastructure_router
from api.risk import router as risk_router
from api.ai import router as ai_router
from api.alerts import router as alerts_router
from api.reports import router as reports_router

__all__ = [
    "system_router",
    "cyclone_router",
    "weather_router",
    "satellite_router",
    "infrastructure_router",
    "risk_router",
    "ai_router",
    "alerts_router",
    "reports_router"
]
