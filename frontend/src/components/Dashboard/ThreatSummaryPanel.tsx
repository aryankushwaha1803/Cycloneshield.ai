import React from 'react';
import { Wind, Gauge, Compass, MapPin, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { CycloneData, WeatherCurrent } from '../../types';
import { DataProvenanceBadge } from '../Common/DataProvenanceBadge';

interface ThreatSummaryPanelProps {
  cyclone: CycloneData | null;
  weather: WeatherCurrent | null;
}

export const ThreatSummaryPanel: React.FC<ThreatSummaryPanelProps> = ({ cyclone, weather }) => {
  if (!cyclone) return null;

  const curr = cyclone.current_position;
  const isHighSeverity = curr.wind_speed_kmh >= 140;

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            CURRENT THREAT PROFILE
          </div>
          <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
            {cyclone.name}
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              {cyclone.status}
            </span>
          </h3>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            {cyclone.basin} • Category: <span className="text-amber-300 font-semibold">{curr.category}</span>
          </div>
        </div>
        <DataProvenanceBadge
          source={cyclone.source}
          dataType="OBSERVED"
          timestamp={new Date(curr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        />
      </div>

      {/* Main Meteorological Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Wind Speed */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" /> Sustained Wind
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {curr.wind_speed_kmh}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">km/h</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {curr.wind_speed_kts} knots • Gale force
          </div>
        </div>

        {/* Central Pressure */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" /> Central Pressure
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-300">
            {curr.pressure_hpa}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">hPa</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            ΔP: -{(1013.25 - curr.pressure_hpa).toFixed(1)} hPa deficit
          </div>
        </div>

        {/* Movement */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" /> Heading & Speed
            </span>
          </div>
          <div className="text-base font-mono font-bold text-white">
            {curr.movement_dir.toFixed(0)}° at {curr.movement_speed_kmh} km/h
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Forward velocity vector
          </div>
        </div>

        {/* Position */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Coordinates
            </span>
          </div>
          <div className="text-sm font-mono font-bold text-white">
            {curr.latitude.toFixed(2)}°N, {curr.longitude.toFixed(2)}°E
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Lat/Lon coordinate fix
          </div>
        </div>
      </div>

      {/* Live Weather Station Observations */}
      {weather && (
        <div className="bg-[#0b1324] p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
            <span className="font-mono text-cyan-300 font-bold">
              Station Telemetry ({weather.source.split(' ')[0]})
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Updated: {new Date(weather.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400">24h Rainfall</div>
              <div className="font-bold text-white mt-0.5">{weather.rainfall_mm_24h} mm</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Surface Temp</div>
              <div className="font-bold text-white mt-0.5">{weather.temperature_c}°C</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Humidity</div>
              <div className="font-bold text-white mt-0.5">{weather.humidity_percent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Landfall Forecast Trajectory Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 p-3 rounded-lg border border-red-900/60 flex items-start space-x-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-white">
            Estimated Landfall Target: {cyclone.forecast_points[0]?.category || 'Coastal Corridor'}
          </div>
          <div className="text-[11px] text-slate-300 leading-relaxed">
            Projected coastal impact within next 12–24 hours with gale-to-storm force wind radii extending up to 120 km from eye.
          </div>
        </div>
      </div>
    </div>
  );
};
