import React, { useState } from 'react';
import { CycloneMap } from '../components/Map/CycloneMap';
import { ThreatSummaryPanel } from '../components/Dashboard/ThreatSummaryPanel';
import { ExposureStats } from '../components/Dashboard/ExposureStats';
import { EvacuationPriorityPanel } from '../components/Risk/EvacuationPriorityPanel';
import { RiskScoreExplainer } from '../components/Risk/RiskScoreExplainer';
import {
  CycloneData,
  WeatherCurrent,
  WeatherForecast,
  RiskCalculationResponse,
  InfrastructureAsset,
  EvacuationZone,
  SatelliteLayer
} from '../types';
import { Activity, CloudRain, Wind, Layers, AlertTriangle } from 'lucide-react';

interface CommandCenterPageProps {
  cyclone: CycloneData | null;
  weather: WeatherCurrent | null;
  forecast: WeatherForecast | null;
  riskData: RiskCalculationResponse | null;
  infrastructure: InfrastructureAsset[];
  satelliteLayers: SatelliteLayer[];
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  cyclone,
  weather,
  forecast,
  riskData,
  infrastructure,
  satelliteLayers,
}) => {
  const [selectedEvacuationZone, setSelectedEvacuationZone] = useState<EvacuationZone | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);
  const [activeTimelineHour, setActiveTimelineHour] = useState<number>(24);

  return (
    <div className="space-y-4 p-4 max-w-[1700px] mx-auto">
      {/* Top Exposure Stats Bar */}
      <ExposureStats
        riskData={riskData}
        onOpenExplainer={() => setIsExplainerOpen(true)}
      />

      {/* Main Command Center Layout: Map (Left/Center, ~65%) + Threat & Evacuation (Right, ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left GIS Interactive Map View */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="h-[620px] w-full">
            <CycloneMap
              cyclone={cyclone}
              riskData={riskData}
              infrastructure={infrastructure}
              satelliteLayers={satelliteLayers}
              onSelectEvacuationZone={(zone) => setSelectedEvacuationZone(zone)}
              selectedEvacuationZone={selectedEvacuationZone}
            />
          </div>

          {/* Bottom Horizon Controls & Numerical Forecast Charts */}
          {forecast && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    Chronological Forecast Timeline & Impact Projection
                  </span>
                </div>
                {/* 6h, 12h, 24h, 48h horizon buttons */}
                <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                  <span className="text-slate-400 mr-1">Horizon:</span>
                  {[6, 12, 24, 48].map((h) => (
                    <button
                      key={h}
                      onClick={() => setActiveTimelineHour(h)}
                      className={`px-2 py-1 rounded transition border ${
                        activeTimelineHour === h
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500/80 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      +{h} Hours
                    </button>
                  ))}
                </div>
              </div>

              {/* Forecast Timeline Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-x-auto">
                {forecast.forecast_hours.slice(0, activeTimelineHour / 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 p-2 rounded text-center font-mono space-y-1"
                  >
                    <div className="text-[10px] text-slate-400">
                      {item.time.split('T')[1]?.slice(0, 5) || `+${(idx + 1) * 3}h`}
                    </div>
                    <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      {item.wind_speed_kmh} <span className="text-[9px] font-normal text-slate-400">km/h</span>
                    </div>
                    <div className="text-xs font-bold text-purple-300 flex items-center justify-center gap-1">
                      <CloudRain className="w-3 h-3 text-purple-400" />
                      {item.precipitation_mm} <span className="text-[9px] font-normal text-slate-400">mm</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.pressure_hpa} hPa
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Threat & Evacuation Triage Column */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <ThreatSummaryPanel
            cyclone={cyclone}
            weather={weather}
          />

          {riskData && (
            <EvacuationPriorityPanel
              zones={riskData.evacuation_zones}
              selectedZone={selectedEvacuationZone}
              onSelectZone={(z) => setSelectedEvacuationZone(z)}
            />
          )}
        </div>
      </div>

      {/* Explainer Modal */}
      <RiskScoreExplainer
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        riskData={riskData}
      />
    </div>
  );
};
