from abc import ABC, abstractmethod
from typing import List, Optional
from models.schemas import CycloneResponse, HistoricalCycloneListItem

class BaseCycloneProvider(ABC):
    @abstractmethod
    def get_provider_name(self) -> str:
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        pass

    @abstractmethod
    async def get_active_cyclone(self) -> Optional[CycloneResponse]:
        pass

    @abstractmethod
    async def get_historical_cyclones(self) -> List[HistoricalCycloneListItem]:
        pass

    @abstractmethod
    async def get_cyclone_by_id(self, storm_id: str) -> Optional[CycloneResponse]:
        pass
