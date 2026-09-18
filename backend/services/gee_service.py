import datetime
from typing import List, Dict, Any
from providers.satellite.gee_adapter import GEEAdapter
from models.schemas import SatelliteLayerSchema

class GEEService:
    def __init__(self):
        self.adapter = GEEAdapter()

    def get_status_info(self) -> Dict[str, Any]:
        return self.adapter.get_status_info()

    def get_satellite_layers(self, lat: float, lon: float) -> List[SatelliteLayerSchema]:
        return self.adapter.get_layers(lat, lon)

gee_service = GEEService()
