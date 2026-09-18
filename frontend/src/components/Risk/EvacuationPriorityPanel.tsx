import React from 'react';
import { ShieldAlert, Users, Waves, CloudRain, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import { EvacuationZone } from '../../types';

interface EvacuationPriorityPanelProps {
  zones: EvacuationZone[];
  selectedZone: EvacuationZone | null;
  onSelectZone: (zone: EvacuationZone) => void;
}

export const EvacuationPriorityPanel: React.FC<EvacuationPriorityPanelProps> = ({
  zones,
  selectedZone,
  onSelectZone,
}) => {
  const activeZone = selectedZone || zones[0];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'HIGH':
        return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            EVACUATION PRIORITY ENGINE
          </div>
          <h3 className="text-base font-bold text-white mt-0.5 tracking-tight flex items-center gap-2">
            Decision-Support Sector Triage
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
          {zones.length} SECTORS ANALYZED
        </span>
      </div>

      {/* Sector Selection Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1">
        {zones.map((z) => {
          const isSelected = activeZone?.zone_id === z.zone_id;
          return (
            <button
              key={z.zone_id}
              onClick={() => onSelectZone(z)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition border whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 font-bold shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  z.priority === 'CRITICAL'
                    ? 'bg-red-500'
                    : z.priority === 'HIGH'
                    ? 'bg-orange-500'
                    : 'bg-amber-400'
                }`}
              />
              <span>{z.name.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sector "WHY THIS AREA?" Card */}
      {activeZone && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
            <div>
              <div className="text-xs font-mono uppercase text-cyan-400">
                WHY THIS AREA? (EXPLAINABLE TRIAGE)
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeZone.name}</h4>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getPriorityStyle(
                activeZone.priority
              )}`}
            >
              {activeZone.priority} PRIORITY
            </span>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" /> Population
              </div>
              <div className="text-base font-bold text-white mt-1">
                {activeZone.population.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Waves className="w-3 h-3 text-sky-400" /> Storm Surge
              </div>
              <div className="text-base font-bold text-sky-400 mt-1">
                {activeZone.surge_height_m.toFixed(1)} m
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-purple-400" /> 24h Rainfall
              </div>
              <div className="text-base font-bold text-purple-300 mt-1">
                {activeZone.rainfall_mm_24h} mm
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-amber-400" /> Nearest Shelter
              </div>
              <div className="text-base font-bold text-amber-300 mt-1">
                {activeZone.nearest_shelter_km} km
              </div>
            </div>
          </div>

          {/* Road Accessibility Status */}
          <div className="flex items-center justify-between text-xs bg-slate-950 px-3 py-2 rounded border border-slate-800 font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Road Accessibility Vulnerability:
            </span>
            <span
              className={`font-bold uppercase ${
                activeZone.road_risk_level === 'IMPASSABLE'
                  ? 'text-red-400'
                  : activeZone.road_risk_level === 'HIGH'
                  ? 'text-orange-400'
                  : 'text-amber-300'
              }`}
            >
              {activeZone.road_risk_level}
            </span>
          </div>

          {/* Detailed Decision Support Rationale */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-0.5">Triage Rationale:</strong>
            {activeZone.rationale}
          </div>

          <div className="text-[10px] font-mono text-slate-500 italic">
            * Note: Decision-support guidance for disaster management officials, not an official public evacuation order.
          </div>
        </div>
      )}
    </div>
  );
};
