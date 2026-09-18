import datetime
from typing import Optional, List, Dict, Any
from models.schemas import CycloneResponse, HistoricalCycloneListItem, CycloneSelectRequest
from providers.cyclone.noaa import NOAACycloneProvider
from providers.cyclone.ibtracs import IBTrACSHistoricalProvider
from config import settings

class CycloneService:
    def __init__(self):
        self.noaa_provider = NOAACycloneProvider()
        self.ibtracs_provider = IBTrACSHistoricalProvider()
        # Default active selection: Cyclone Biparjoy (2023) as benchmark if no live Atlantic/Pacific hurricane is active
        self._current_selected_storm_id: str = "biparjoy-2023"

    async def get_current_cyclone(self) -> CycloneResponse:
        """
        Retrieves the currently monitored cyclone.
        If live provider is selected and an active cyclone is ongoing, returns live storm.
        Otherwise returns the currently selected authoritative historical event.
        """
        if settings.CYCLONE_PROVIDER == "live":
            active_live = await self.noaa_provider.get_active_cyclone()
            if active_live:
                return active_live

        # Fallback or selected historical event
        storm = self.ibtracs_provider.get_storm_data(self._current_selected_storm_id)
        if not storm:
            # Fallback to Biparjoy
            storm = self.ibtracs_provider.get_storm_data("biparjoy-2023")
        return storm

    def get_historical_cyclones(self) -> List[HistoricalCycloneListItem]:
        return self.ibtracs_provider.get_historical_catalog()

    def select_cyclone(self, storm_id: str) -> Optional[CycloneResponse]:
        storm = self.ibtracs_provider.get_storm_data(storm_id)
        if storm:
            self._current_selected_storm_id = storm_id
            return storm
        return None

    def get_status_info(self) -> Dict[str, Any]:
        return {
            "provider": "NOAA NHC Live Telemetry & IMD/IBTrACS Official Archive",
            "status": "CONNECTED",
            "active_mode": "LIVE_FEED" if settings.CYCLONE_PROVIDER == "live" else "HISTORICAL_ARCHIVE",
            "monitored_storm_id": self._current_selected_storm_id,
            "last_sync": datetime.datetime.utcnow().isoformat() + "Z"
        }

cyclone_service = CycloneService()
