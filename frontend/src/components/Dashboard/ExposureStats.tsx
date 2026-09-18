import React from 'react';
import { Users, Waves, Building2, CloudRain, HelpCircle, ShieldAlert } from 'lucide-react';
import { RiskCalculationResponse } from '../../types';
import { DataProvenanceBadge } from '../Common/DataProvenanceBadge';

interface ExposureStatsProps {
  riskData: RiskCalculationResponse | null;
  onOpenExplainer: () => void;
}

export const ExposureStats: React.FC<ExposureStatsProps> = ({ riskData, onOpenExplainer }) => {
  if (!riskData) return null;

  const score = riskData.overall_risk_score;
  const level = riskData.risk_level;

  const getScoreColor = () => {
    if (score >= 76) return 'text-red-500 from-red-500 to-rose-600';
    if (score >= 51) return 'text-orange-500 from-orange-500 to-amber-600';
    if (score >= 26) return 'text-amber-400 from-amber-400 to-yellow-600';
    return 'text-emerald-400 from-emerald-400 to-teal-600';
  };

  const getBadgeStyle = () => {
    if (score >= 76) return 'bg-red-950/80 text-red-300 border-red-800';
    if (score >= 51) return 'bg-orange-950/80 text-orange-300 border-orange-800';
    if (score >= 26) return 'bg-amber-950/80 text-amber-300 border-amber-800';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Overall Risk Score Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Composite Risk Score
          </span>
          <button
            onClick={onOpenExplainer}
            className="text-cyan-400 hover:text-cyan-200 transition p-1 hover:bg-slate-800 rounded"
            title="Inspect 'Why is this score X?' breakdown"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="my-2 flex items-baseline space-x-2">
          <div className={`text-4xl font-extrabold font-mono tracking-tight bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`}>
            {score.toFixed(1)}
          </div>
          <span className="text-xs text-slate-500 font-mono">/ 100</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getBadgeStyle()}`}>
            {level} THREAT
          </span>
          <button
            onClick={onOpenExplainer}
            className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Why {score.toFixed(0)}? &rarr;
          </button>
        </div>
      </div>

      {/* 2. Population Exposure Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" /> Population Exposure
          </span>
          <DataProvenanceBadge source="Demographic Model" dataType="MODELED" />
        </div>

        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            {riskData.exposed_population.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Residents in high-inundation corridor
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
          Sector 1 Lowlands: {riskData.evacuation_zones[0]?.population.toLocaleString() || 'N/A'}
        </div>
      </div>

      {/* 3. Storm Surge Inundation Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
            <Waves className="w-3 h-3 text-sky-400" /> Modeled Peak Surge
          </span>
          <DataProvenanceBadge source="SLOSH Equations" dataType="MODELED" />
        </div>

        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-sky-400 tracking-tight">
            {riskData.storm_surge.estimated_surge_m.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">meters</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Area: {riskData.storm_surge.affected_area_km2} km² coastal reach
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1 truncate">
          Penetration: ~{riskData.storm_surge.coastal_penetration_km} km inland
        </div>
      </div>

      {/* 4. Critical Infrastructure Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
            <Building2 className="w-3 h-3 text-amber-400" /> Infrastructure Exposure
          </span>
          <DataProvenanceBadge source="OSM Overpass" dataType="OBSERVED" />
        </div>

        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-amber-300 tracking-tight">
            {riskData.critical_infrastructure_exposed}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Critical facilities in high-risk zones
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
          Hospitals & Power Substations
        </div>
      </div>

      {/* 5. 24h Rainfall & Access Pathway Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-purple-400" /> Rainfall Pathway
          </span>
          <DataProvenanceBadge source="Open-Meteo GFS" dataType="OBSERVED" />
        </div>

        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-purple-300 tracking-tight">
            {riskData.rainfall_pathways.horizons['24h_mm']}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Road Status:{' '}
            <strong className="text-amber-300">
              {riskData.rainfall_pathways.road_vulnerability_status}
            </strong>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
          ~{riskData.rainfall_pathways.submerged_road_culverts_est} culverts submerged
        </div>
      </div>
    </div>
  );
};
