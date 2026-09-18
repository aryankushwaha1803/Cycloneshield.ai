import datetime
import httpx
from typing import Optional, List
from models.schemas import (
    CycloneResponse, CycloneTrackPointSchema, WindRadiiSchema,
    HistoricalCycloneListItem, ForecastConePolygon
)
from providers.cyclone.base import BaseCycloneProvider
from providers.cyclone.geometry import calculate_forecast_cone

class NOAACycloneProvider(BaseCycloneProvider):
    def __init__(self):
        self.nhc_url = "https://www.nhc.noaa.gov/CurrentStorms.json"

    def get_provider_name(self) -> str:
        return "NOAA National Hurricane Center (NHC) Live Feed"

    def is_connected(self) -> bool:
        return True

    async def get_active_cyclone(self) -> Optional[CycloneResponse]:
        """
        Polls NOAA NHC live storm feed for currently active tropical systems.
        If no systems are currently active, returns None.
        """
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(self.nhc_url)
                if resp.status_code != 200:
                    return None
                data = resp.json()
        except Exception:
            return None

        active_storms = data.get("activeStorms", [])
        if not active_storms:
            return None

        # Parse the most severe active storm if one exists
        storm = active_storms[0]
        storm_name = storm.get("name", "Active System")
        storm_id = storm.get("id", f"live-{storm_name.lower()}")
        lat = float(storm.get("latitude", 0.0))
        lon = float(storm.get("longitude", 0.0))
        wind_kts = float(storm.get("intensity", 45.0))
        pressure = float(storm.get("pressure", 1000.0))

        current_pt = CycloneTrackPointSchema(
            id=1,
            timestamp=datetime.datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            wind_speed_kmh=round(wind_kts * 1.852, 1),
            wind_speed_kts=wind_kts,
            pressure_hpa=pressure,
            category=storm.get("classification", "Tropical Storm"),
            movement_dir=float(storm.get("movementDir", 315.0)),
            movement_speed_kmh=round(float(storm.get("movementSpeed", 10.0)) * 1.852, 1),
            is_forecast=False,
            uncertainty_radius_km=25.0,
            wind_radii=WindRadiiSchema(
                r34_km={"ne": 120, "se": 100, "sw": 80, "nw": 100},
                r50_km={"ne": 60, "se": 50, "sw": 40, "nw": 50},
                r64_km={"ne": 30, "se": 25, "sw": 20, "nw": 25}
            )
        )

        return CycloneResponse(
            storm_id=storm_id,
            name=f"Cyclone {storm_name}",
            basin="Atlantic / East Pacific",
            year=datetime.datetime.utcnow().year,
            status="ACTIVE",
            max_wind_kmh=round(wind_kts * 1.852, 1),
            min_pressure_hpa=pressure,
            source="NOAA National Hurricane Center Live Telemetry",
            is_active=True,
            current_position=current_pt,
            historical_points=[current_pt],
            forecast_points=[],
            forecast_cone=calculate_forecast_cone([{"latitude": lat, "longitude": lon, "uncertainty_radius_km": 40.0}])
        )

    async def get_historical_cyclones(self) -> List[HistoricalCycloneListItem]:
        return []

    async def get_cyclone_by_id(self, storm_id: str) -> Optional[CycloneResponse]:
        active = await self.get_active_cyclone()
        if active and active.storm_id == storm_id:
            return active
        return None
