import React from 'react';
import { Activity, Wind, Gauge, Compass, MapPin, Layers, Calendar, ChevronRight } from 'lucide-react';
import { CycloneData, HistoricalCycloneItem } from '../types';
import { DataProvenanceBadge } from '../components/Common/DataProvenanceBadge';

interface CycloneTrackPageProps {
  cyclone: CycloneData | null;
  historicalList: HistoricalCycloneItem[];
  onSelectCyclone: (stormId: string) => void;
}

export const CycloneTrackPage: React.FC<CycloneTrackPageProps> = ({
  cyclone,
  historicalList,
  onSelectCyclone,
}) => {
  if (!cyclone) return null;

  const curr = cyclone.current_position;
  const radii = curr.wind_radii;

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white">{cyclone.name}</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              {curr.category}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {cyclone.year}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Basin: <strong className="text-slate-200">{cyclone.basin}</strong> • Telemetry Origin:{' '}
            <span className="text-cyan-300">{cyclone.source}</span>
          </p>
        </div>
        <DataProvenanceBadge source={cyclone.source} dataType="OBSERVED" />
      </div>

      {/* Quadrant Wind Radii Cards (34kt, 50kt, 64kt) */}
      {radii && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" /> Quadrant Wind Field Radii (Sustained Wind Extent in km)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              OFFICIAL RADIAL ESTIMATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 34-knot Gale Radii */}
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 font-mono">
                <span>34-Knot Gale Wind Radius</span>
                <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  ~63 km/h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">NE Quadrant</span>
                  <div className="font-bold text-white">{radii.r34_km.ne} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">SE Quadrant</span>
                  <div className="font-bold text-white">{radii.r34_km.se} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">SW Quadrant</span>
                  <div className="font-bold text-white">{radii.r34_km.sw} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">NW Quadrant</span>
                  <div className="font-bold text-white">{radii.r34_km.nw} km</div>
                </div>
              </div>
            </div>

            {/* 50-knot Storm Radii */}
            <div className="bg-slate-900/90 border border-orange-500/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-orange-300 font-mono">
                <span>50-Knot Storm Wind Radius</span>
                <span className="text-[10px] bg-orange-950 px-2 py-0.5 rounded border border-orange-800">
                  ~93 km/h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">NE Quadrant</span>
                  <div className="font-bold text-white">{radii.r50_km.ne.toFixed(0)} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">SE Quadrant</span>
                  <div className="font-bold text-white">{radii.r50_km.se.toFixed(0)} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">SW Quadrant</span>
                  <div className="font-bold text-white">{radii.r50_km.sw.toFixed(0)} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">NW Quadrant</span>
                  <div className="font-bold text-white">{radii.r50_km.nw.toFixed(0)} km</div>
                </div>
              </div>
            </div>

            {/* 64-knot Hurricane Radii */}
            <div className="bg-slate-900/90 border border-red-500/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-red-300 font-mono">
                <span>64-Knot Hurricane Core Radius</span>
                <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  ~119+ km/h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">NE Quadrant</span>
                  <div className="font-bold text-white">{radii.r64_km.ne.toFixed(0)} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">SE Quadrant</span>
                  <div className="font-bold text-white">{radii.r64_km.se.toFixed(0)} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">SW Quadrant</span>
                  <div className="font-bold text-white">{radii.r64_km.sw.toFixed(0)} km</div>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">NW Quadrant</span>
                  <div className="font-bold text-white">{radii.r64_km.nw.toFixed(0)} km</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Track Points Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Best Track Coordinate Sequence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative time series fixes with observed central pressure and sustained intensity.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300">
            {cyclone.historical_points.length + cyclone.forecast_points.length} TOTAL FIXES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-950/60">
                <th className="py-2.5 px-3">Fix Type</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Lat / Lon</th>
                <th className="py-2.5 px-3">Wind (km/h)</th>
                <th className="py-2.5 px-3">Pressure (hPa)</th>
                <th className="py-2.5 px-3">Category / Intensity</th>
                <th className="py-2.5 px-3">Forward Motion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cyclone.historical_points.map((pt, idx) => (
                <tr key={`hist-${idx}`} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 text-orange-400 font-bold">OBSERVED</td>
                  <td className="py-2.5 px-3">{new Date(pt.timestamp).toUTCString()}</td>
                  <td className="py-2.5 px-3">{pt.latitude.toFixed(2)}°N, {pt.longitude.toFixed(2)}°E</td>
                  <td className="py-2.5 px-3 font-bold text-white">{pt.wind_speed_kmh}</td>
                  <td className="py-2.5 px-3 text-amber-300">{pt.pressure_hpa}</td>
                  <td className="py-2.5 px-3">{pt.category}</td>
                  <td className="py-2.5 px-3">{pt.movement_dir}° at {pt.movement_speed_kmh} km/h</td>
                </tr>
              ))}
              {cyclone.forecast_points.map((pt, idx) => (
                <tr key={`fc-${idx}`} className="hover:bg-slate-900/50 bg-cyan-950/10">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">FORECAST (+{(idx + 1) * 12}h)</td>
                  <td className="py-2.5 px-3">{new Date(pt.timestamp).toUTCString()}</td>
                  <td className="py-2.5 px-3">{pt.latitude.toFixed(2)}°N, {pt.longitude.toFixed(2)}°E</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-200">{pt.wind_speed_kmh}</td>
                  <td className="py-2.5 px-3 text-amber-300">{pt.pressure_hpa}</td>
                  <td className="py-2.5 px-3 text-slate-200">{pt.category}</td>
                  <td className="py-2.5 px-3 text-slate-400">Radius: ±{pt.uncertainty_radius_km} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
