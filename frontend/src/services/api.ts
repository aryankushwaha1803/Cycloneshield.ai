import {
  SystemStatusResponse,
  SystemHealthResponse,
  CycloneData,
  HistoricalCycloneItem,
  WeatherCurrent,
  WeatherForecast,
  SatelliteLayer,
  InfrastructureAsset,
  RiskCalculationResponse,
  AIAnalysisResponse,
  AlertDispatchResponse,
  SituationReportResponse,
  UserRole
} from '../types';

const API_BASE = '/api';

export const api = {
  // System Status & Health
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error(`System status error: ${res.statusText}`);
    return res.json();
  },

  async getSystemHealth(): Promise<SystemHealthResponse> {
    const res = await fetch(`${API_BASE}/system/health`);
    if (!res.ok) throw new Error(`System health error: ${res.statusText}`);
    return res.json();
  },

  // Cyclone Feeds & Historical Archives
  async getCurrentCyclone(): Promise<CycloneData> {
    const res = await fetch(`${API_BASE}/cyclone/current`);
    if (!res.ok) throw new Error(`Cyclone feed error: ${res.statusText}`);
    return res.json();
  },

  async getHistoricalCyclones(): Promise<HistoricalCycloneItem[]> {
    const res = await fetch(`${API_BASE}/cyclone/historical`);
    if (!res.ok) throw new Error(`Historical cyclone catalog error: ${res.statusText}`);
    return res.json();
  },

  async selectCyclone(stormId: string): Promise<CycloneData> {
    const res = await fetch(`${API_BASE}/cyclone/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storm_id: stormId }),
    });
    if (!res.ok) throw new Error(`Select cyclone error: ${res.statusText}`);
    return res.json();
  },

  // Weather Telemetry
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherCurrent> {
    const res = await fetch(`${API_BASE}/weather/current?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Weather error: ${res.statusText}`);
    return res.json();
  },

  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
    const res = await fetch(`${API_BASE}/weather/forecast?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Weather forecast error: ${res.statusText}`);
    return res.json();
  },

  // Satellite & GEE
  async getSatelliteLayers(lat: number, lon: number): Promise<SatelliteLayer[]> {
    const res = await fetch(`${API_BASE}/satellite/layers?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Satellite layers error: ${res.statusText}`);
    return res.json();
  },

  // Infrastructure Assets
  async getInfrastructure(assetType?: string): Promise<InfrastructureAsset[]> {
    const url = assetType ? `${API_BASE}/infrastructure?asset_type=${assetType}` : `${API_BASE}/infrastructure`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Infrastructure error: ${res.statusText}`);
    return res.json();
  },

  // Deterministic Risk Engine
  async calculateRisk(): Promise<RiskCalculationResponse> {
    const res = await fetch(`${API_BASE}/risk/calculate`, { method: 'POST' });
    if (!res.ok) throw new Error(`Risk calculation error: ${res.statusText}`);
    return res.json();
  },

  async simulateRisk(payload: {
    storm_id: string;
    wind_speed_delta_kmh?: number;
    pressure_delta_hpa?: number;
    surge_height_override_m?: number;
    rainfall_multiplier?: number;
  }): Promise<RiskCalculationResponse> {
    const res = await fetch(`${API_BASE}/risk/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Risk simulation error: ${res.statusText}`);
    return res.json();
  },

  // Gemini AI Disaster Reasoning
  async runGeminiAnalysis(stormId: string): Promise<AIAnalysisResponse> {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storm_id: stormId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Gemini AI invocation failed.');
    }
    return res.json();
  },

  async generateAdvisory(stormId: string, targetAudience: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storm_id: stormId, target_audience: targetAudience }),
    });
    if (!res.ok) throw new Error(`Advisory generation error: ${res.statusText}`);
    return res.json();
  },

  // Alerts & Early Warning
  async dispatchAlert(
    alertData: {
      title: string;
      message: string;
      recipient_group: string;
      channel: string;
    },
    userRole: UserRole
  ): Promise<AlertDispatchResponse> {
    const res = await fetch(`${API_BASE}/alerts/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole,
      },
      body: JSON.stringify(alertData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to dispatch alert.');
    }
    return res.json();
  },

  async getAlertHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/alerts/history`);
    if (!res.ok) throw new Error(`Alert history error: ${res.statusText}`);
    return res.json();
  },

  // Situation Reports
  async getSituationReport(): Promise<SituationReportResponse> {
    const res = await fetch(`${API_BASE}/reports/situation`);
    if (!res.ok) throw new Error(`Situation report error: ${res.statusText}`);
    return res.json();
  },
};
