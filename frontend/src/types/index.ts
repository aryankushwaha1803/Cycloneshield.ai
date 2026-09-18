export type UserRole = 'ADMIN' | 'DISASTER_AUTHORITY' | 'FIELD_OPERATOR' | 'VIEWER';

export interface DataSourceStatus {
  service_key: string;
  display_name: string;
  provider_name: string;
  endpoint_url: string;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';
  last_ping: string;
  latency_ms: number;
  last_error?: string | null;
  details: Record<string, any>;
}

export interface SystemStatusResponse {
  timestamp: string;
  system_mode: string;
  services: DataSourceStatus[];
}

export interface SystemHealthResponse {
  database: string;
  gee: string;
  gemini: string;
  weather: string;
  cyclone: string;
  infrastructure: string;
  alerts: string;
  all_healthy: boolean;
  details: Record<string, string>;
}

export interface WindRadii {
  r34_km: Record<string, number>;
  r50_km: Record<string, number>;
  r64_km: Record<string, number>;
}

export interface CycloneTrackPoint {
  id?: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  wind_speed_kmh: number;
  wind_speed_kts: number;
  pressure_hpa: number;
  category: string;
  movement_dir: number;
  movement_speed_kmh: number;
  is_forecast: boolean;
  uncertainty_radius_km: number;
  wind_radii?: WindRadii;
}

export interface ConePoint {
  latitude: number;
  longitude: number;
  radius_km: number;
}

export interface ForecastCone {
  cone_points: ConePoint[];
  polygon_coordinates: [number, number][];
}

export interface CycloneData {
  storm_id: string;
  name: string;
  basin: string;
  year: number;
  status: string;
  max_wind_kmh: number;
  min_pressure_hpa: number;
  source: string;
  is_active: boolean;
  current_position: CycloneTrackPoint;
  historical_points: CycloneTrackPoint[];
  forecast_points: CycloneTrackPoint[];
  forecast_cone?: ForecastCone;
}

export interface HistoricalCycloneItem {
  storm_id: string;
  name: string;
  basin: string;
  year: number;
  category: string;
  max_wind_kmh: number;
  min_pressure_hpa: number;
  landfall_area: string;
  source: string;
}

export interface WeatherCurrent {
  source: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location_name: string;
  temperature_c: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  pressure_hpa: number;
  rainfall_mm_24h: number;
  humidity_percent: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature_c: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  pressure_hpa: number;
}

export interface WeatherForecast {
  source: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  forecast_hours: HourlyForecastItem[];
}

export interface SatelliteLayer {
  id: string;
  name: string;
  source: string;
  dataset_name: string;
  timestamp: string;
  status: 'LIVE' | 'AVAILABLE' | 'UNAVAILABLE';
  layer_type: string;
  url_template: string;
  description: string;
  attribution: string;
}

export interface InfrastructureAsset {
  id: number;
  osm_id: string;
  name: string;
  asset_type: 'hospital' | 'shelter' | 'bridge' | 'power_substation' | 'telecom' | 'road';
  latitude: number;
  longitude: number;
  source: string;
  capacity: number;
  elevation_m: number;
  distance_to_coast_km: number;
  risk_score: number;
  hazards: string[];
}

export interface RiskScoreBreakdown {
  surge_score: number;
  surge_weight: number;
  wind_score: number;
  wind_weight: number;
  rain_score: number;
  rain_weight: number;
  infra_score: number;
  infra_weight: number;
  exposure_score: number;
  exposure_weight: number;
  overall_score: number;
  formula_display: string;
}

export interface EvacuationZone {
  zone_id: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  population: number;
  surge_height_m: number;
  rainfall_mm_24h: number;
  nearest_shelter_km: number;
  road_risk_level: string;
  center_lat: number;
  center_lon: number;
  polygon_coordinates: [number, number][];
  rationale: string;
}

export interface RiskCalculationResponse {
  cyclone_id: string;
  timestamp: string;
  overall_risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  storm_surge: {
    estimated_surge_m: number;
    barometric_component_m: number;
    wind_stress_component_m: number;
    affected_area_km2: number;
    population_exposure: number;
    coastal_penetration_km: number;
    coastal_front_km: number;
    shoaling_factor: number;
    shelf_width_km: number;
    model_type: string;
    provenance: string;
  };
  rainfall_pathways: {
    horizons: {
      '6h_mm': number;
      '12h_mm': number;
      '24h_mm': number;
      '48h_mm': number;
    };
    depression_accumulation_cm: number;
    submerged_road_culverts_est: number;
    road_vulnerability_status: string;
    hydrological_pathway: string;
    provenance: string;
  };
  factor_breakdown: RiskScoreBreakdown;
  evacuation_zones: EvacuationZone[];
  critical_infrastructure_exposed: number;
  exposed_population: number;
  model_metadata: Record<string, any>;
}

export interface AIAnalysisResponse {
  source: string;
  model: string;
  timestamp: string;
  risk_explanation: string;
  main_hazards: string[];
  infrastructure_concerns: string[];
  evacuation_priorities: string[];
  recommended_preparedness_actions: string[];
  early_warning_advisory: string;
  data_uncertainty_explanation: string;
  raw_structured_input_summary: Record<string, any>;
}

export interface AlertDispatchResponse {
  alert_id: number;
  channel: string;
  recipient_group: string;
  recipient_count: number;
  status: string;
  mode: 'LIVE' | 'SIMULATION';
  provider: string;
  dispatched_at: string;
  message: string;
}

export interface SituationReportResponse {
  report_id: number;
  cyclone_name: string;
  generated_at: string;
  generated_by: string;
  threat_status: string;
  meteorological_summary: Record<string, any>;
  surge_and_flood_summary: Record<string, any>;
  infrastructure_impact_summary: Record<string, any>;
  evacuation_summary: Record<string, any>;
  official_advisory: string;
}
