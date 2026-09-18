import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  Compass,
  Radio,
  CheckCircle2,
  ExternalLink,
  Activity
} from 'lucide-react';
import { CycloneData, HistoricalCycloneItem } from '../types';

interface LandingPageProps {
  onEnterCommandCenter: () => void;
  onOpenLiveRunner: () => void;
  currentCyclone: CycloneData | null;
  historicalList: HistoricalCycloneItem[];
  onSelectCyclone: (stormId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterCommandCenter,
  onOpenLiveRunner,
  currentCyclone,
  historicalList,
  onSelectCyclone,
}) => {
  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1933] via-[#0f172a] to-[#0a0f1d] border border-cyan-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>STRICT REAL-DATA DISASTER INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            CYCLONESHIELD <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-lg text-slate-300 font-sans leading-relaxed">
            Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster.
            Synthesizes authoritative meteorological telemetry, physical SLOSH storm surge equations,
            OpenStreetMap geospatial assets, and Google Gemini AI multimodal reasoning for rapid decision support.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onEnterCommandCenter}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenLiveRunner}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Launch 12-Step Live Analysis</span>
            </button>
          </div>
        </div>

        {/* Real Data Guarantee Badges */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-slate-800/80 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Open-Meteo Live NWP</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>NOAA / IMD Feeds</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>SLOSH Parametric Surge</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Gemini Multimodal AI</span>
          </div>
        </div>
      </div>

      {/* Real Historical Cyclone Selector Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Authoritative Cyclone Scenarios (No Fake Numbers)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select verified cyclonic events from official IMD RSMC and NOAA IBTrACS archives for instant impact simulation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historicalList.map((storm) => {
            const isCurrent = currentCyclone?.storm_id === storm.storm_id;
            return (
              <div
                key={storm.storm_id}
                onClick={() => {
                  onSelectCyclone(storm.storm_id);
                  onEnterCommandCenter();
                }}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                      {storm.basin} ({storm.year})
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      {storm.category.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{storm.name}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Landfall Corridor: <strong className="text-slate-200">{storm.landfall_area}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400">Peak Winds</span>
                    <div className="text-white font-bold">{storm.max_wind_kmh} km/h</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400">Central Min P</span>
                    <div className="text-amber-300 font-bold">{storm.min_pressure_hpa} hPa</div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                  <span className="truncate max-w-[200px]">{storm.source}</span>
                  <span className="text-cyan-400 font-bold hover:underline">Load Track &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparency Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-xl space-y-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg w-fit text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Live Meteorological Telemetry</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly connected to Open-Meteo providing live observations from ECMWF and NOAA GFS. Real station pressure, anemometer wind vectors, and 24-hour rainfall accumulations.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-xl space-y-3">
          <div className="p-2.5 bg-sky-950 border border-sky-800 rounded-lg w-fit text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Physical Hydrodynamic Modeling</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deterministic Jelesnianski SLOSH equations calculate barometric inverted-barometer surge and wind stress setup without black-box guessing.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-xl space-y-3">
          <div className="p-2.5 bg-purple-950 border border-purple-800 rounded-lg w-fit text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Google Gemini Multimodal AI</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Structured reasoning synthesizes compound hazard interactions, evacuation choke points, and emergency broadcast advisories strictly grounded on verified inputs.
          </p>
        </div>
      </div>
    </div>
  );
};
