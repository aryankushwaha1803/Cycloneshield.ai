import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- System & Status ---
class DataSourceStatusSchema(BaseModel):
    service_key: str
    display_name: str
    provider_name: str
    endpoint_url: str
    status: str  # CONNECTED, NOT_CONFIGURED, UNAVAILABLE
    last_ping: datetime.datetime
    latency_ms: float
    last_error: Optional[str] = None
    details: Dict[str, Any] = {}

class SystemStatusResponse(BaseModel):
    timestamp: datetime.datetime
    system_mode: str  # "LIVE" or "DEMO / SIMULATION"
    services: List[DataSourceStatusSchema]

class SystemHealthResponse(BaseModel):
    database: str
    gee: str
    gemini: str
    weather: str
    cyclone: str
    infrastructure: str
    alerts: str
    all_healthy: bool
    details: Dict[str, str] = {}

# --- Cyclone ---
class WindRadiiSchema(BaseModel):
    r34_km: Dict[str, float]  # {"ne": ..., "se": ..., "sw": ..., "nw": ...}
    r50_km: Dict[str, float]
    r64_km: Dict[str, float]

class CycloneTrackPointSchema(BaseModel):
    id: Optional[int] = None
    timestamp: datetime.datetime
    latitude: float
    longitude: float
    wind_speed_kmh: float
    wind_speed_kts: float
    pressure_hpa: float
    category: str
    movement_dir: float
    movement_speed_kmh: float
    is_forecast: bool
    uncertainty_radius_km: float
    wind_radii: Optional[WindRadiiSchema] = None

class ConePointSchema(BaseModel):
    latitude: float
    longitude: float
    radius_km: float

class ForecastConePolygon(BaseModel):
    cone_points: List[ConePointSchema]
    polygon_coordinates: List[List[float]]  # GeoJSON polygon ring [[lon, lat], ...]

class CycloneResponse(BaseModel):
    storm_id: str
    name: str
    basin: str
    year: int
    status: str
    max_wind_kmh: float
    min_pressure_hpa: float
    source: str
    is_active: bool
    current_position: CycloneTrackPointSchema
    historical_points: List[CycloneTrackPointSchema]
    forecast_points: List[CycloneTrackPointSchema]
    forecast_cone: Optional[ForecastConePolygon] = None

class HistoricalCycloneListItem(BaseModel):
    storm_id: str
    name: str
    basin: str
    year: int
    category: str
    max_wind_kmh: float
    min_pressure_hpa: float
    landfall_area: str
    source: str

class CycloneSelectRequest(BaseModel):
    storm_id: str

# --- Weather ---
class WeatherCurrentSchema(BaseModel):
    source: str
    timestamp: datetime.datetime
    latitude: float
    longitude: float
    location_name: str
    temperature_c: float
    wind_speed_kmh: float
    wind_direction_deg: float
    pressure_hpa: float
    rainfall_mm_24h: float
    humidity_percent: float

class HourlyForecastItem(BaseModel):
    time: str
    temperature_c: float
    wind_speed_kmh: float
    precipitation_mm: float
    pressure_hpa: float

class WeatherForecastSchema(BaseModel):
    source: str
    timestamp: datetime.datetime
    latitude: float
    longitude: float
    forecast_hours: List[HourlyForecastItem]

# --- Satellite & GEE ---
class SatelliteLayerSchema(BaseModel):
    id: str
    name: str
    source: str
    dataset_name: str
    timestamp: str
    status: str  # LIVE, AVAILABLE, UNAVAILABLE
    layer_type: str  # tile, wms, raster
    url_template: str
    description: str
    attribution: str

# --- Infrastructure ---
class InfrastructureAssetSchema(BaseModel):
    id: int
    osm_id: str
    name: str
    asset_type: str  # hospital, shelter, bridge, power_substation, telecom, road
    latitude: float
    longitude: float
    source: str
    capacity: int
    elevation_m: float
    distance_to_coast_km: float
    risk_score: float
    hazards: List[str]

# --- Risk Engine & Evacuation ---
class RiskScoreBreakdown(BaseModel):
    surge_score: float
    surge_weight: float
    wind_score: float
    wind_weight: float
    rain_score: float
    rain_weight: float
    infra_score: float
    infra_weight: float
    exposure_score: float
    exposure_weight: float
    overall_score: float
    formula_display: str

class EvacuationZoneSchema(BaseModel):
    zone_id: str
    name: str
    priority: str  # CRITICAL, HIGH, MODERATE, LOW
    population: int
    surge_height_m: float
    rainfall_mm_24h: float
    nearest_shelter_km: float
    road_risk_level: str  # LOW, MEDIUM, HIGH, IMPASSABLE
    center_lat: float
    center_lon: float
    polygon_coordinates: List[List[float]]
    rationale: str

class RiskCalculationResponse(BaseModel):
    cyclone_id: str
    timestamp: datetime.datetime
    overall_risk_score: float
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    storm_surge: Dict[str, Any]
    rainfall_pathways: Dict[str, Any]
    factor_breakdown: RiskScoreBreakdown
    evacuation_zones: List[EvacuationZoneSchema]
    critical_infrastructure_exposed: int
    exposed_population: int
    model_metadata: Dict[str, Any]

class RiskSimulateRequest(BaseModel):
    storm_id: str
    wind_speed_delta_kmh: float = 0.0
    pressure_delta_hpa: float = 0.0
    surge_height_override_m: Optional[float] = None
    rainfall_multiplier: float = 1.0

# --- Gemini AI ---
class AIAnalysisRequest(BaseModel):
    storm_id: str
    risk_data: Optional[Dict[str, Any]] = None

class AIAnalysisResponse(BaseModel):
    source: str
    model: str
    timestamp: datetime.datetime
    risk_explanation: str
    main_hazards: List[str]
    infrastructure_concerns: List[str]
    evacuation_priorities: List[str]
    recommended_preparedness_actions: List[str]
    early_warning_advisory: str
    data_uncertainty_explanation: str
    raw_structured_input_summary: Dict[str, Any]

class AdvisoryGenerateRequest(BaseModel):
    storm_id: str
    target_audience: str  # PUBLIC, COASTAL_DISTRICTS, PORT_AUTHORITIES, FIRST_RESPONDERS

# --- Alerts ---
class AlertCreateRequest(BaseModel):
    title: str
    message: str
    recipient_group: str
    channel: str  # SMS, WEBHOOK, EMAIL, PUSH
    sender_role: str = "DISASTER_AUTHORITY"

class AlertDispatchResponse(BaseModel):
    alert_id: int
    channel: str
    recipient_group: str
    recipient_count: int
    status: str
    mode: str  # "LIVE" or "SIMULATION"
    provider: str
    dispatched_at: datetime.datetime
    message: str

# --- Reports ---
class SituationReportResponse(BaseModel):
    report_id: int
    cyclone_name: str
    generated_at: datetime.datetime
    generated_by: str
    threat_status: str
    meteorological_summary: Dict[str, Any]
    surge_and_flood_summary: Dict[str, Any]
    infrastructure_impact_summary: Dict[str, Any]
    evacuation_summary: Dict[str, Any]
    official_advisory: str
