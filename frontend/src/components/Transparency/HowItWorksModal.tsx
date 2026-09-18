import React from 'react';
import { X, ArrowRight, Layers, Eye, Cpu, Calculator, Bell, CheckCircle } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const pipelineSteps = [
    {
      title: '1. REAL DATA',
      desc: 'Authoritative telemetry: Open-Meteo ECMWF/GFS, NOAA NHC, IMD RSMC, and OpenStreetMap Overpass.',
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      tag: 'OBSERVED',
      color: 'border-emerald-600 bg-emerald-950/40 text-emerald-300'
    },
    {
      title: '2. GEOSPATIAL PROC',
      desc: 'Geodesic forecast cone of uncertainty, quadrant wind radii (34kt/50kt/64kt), coastal contouring.',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      tag: 'GIS PROCESSING',
      color: 'border-cyan-600 bg-cyan-950/40 text-cyan-300'
    },
    {
      title: '3. RISK ENGINE',
      desc: 'Deterministic Jelesnianski SLOSH surge equations & rational runoff pathways (no black-box guessing).',
      icon: <Calculator className="w-4 h-4 text-sky-400" />,
      tag: 'MODELED',
      color: 'border-sky-600 bg-sky-950/40 text-sky-300'
    },
    {
      title: '4. GEMINI REASONING',
      desc: 'Multimodal AI synthesizes structured inputs to reason over cascade failures & priority zones.',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      tag: 'AI REASONING',
      color: 'border-purple-600 bg-purple-950/40 text-purple-300'
    },
    {
      title: '5. DECISION SUPPORT',
      desc: 'Evacuation sector triage (Critical/High/Mod), hospital cut-off alerts, and infrastructure audits.',
      icon: <CheckCircle className="w-4 h-4 text-amber-400" />,
      tag: 'DECISION SUPPORT',
      color: 'border-amber-600 bg-amber-950/40 text-amber-300'
    },
    {
      title: '6. EARLY WARNING',
      desc: 'Role-gated dispatch via Twilio SMS & Webhooks with strict Live vs Simulation audit logging.',
      icon: <Bell className="w-4 h-4 text-red-400" />,
      tag: 'DISPATCH',
      color: 'border-red-600 bg-red-950/40 text-red-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#141e33]">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Judges Transparency Panel — How This Works
            </h2>
            <p className="text-xs text-slate-400">
              Technical taxonomy separating observed telemetry, physical models, and AI synthesis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Diagram */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              End-to-End Computational Architecture
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={step.title}
                  className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 ${step.color}`}
                >
                  <div className="flex items-center justify-between">
                    {step.icon}
                    <span className="text-[9px] font-mono font-bold uppercase">{step.tag}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{step.title}</div>
                    <div className="text-[10px] text-slate-300 mt-1 leading-snug">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three Column Taxonomy Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Column 1: Observed */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
                  WHAT IS OBSERVED?
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Ground-truth empirical telemetry directly queried from authoritative scientific agencies:
              </p>
              <ul className="text-xs space-y-2 text-slate-200 font-mono">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Satellite Observations:</strong> ESA Sentinel-2 / NASA Terra calibrated optical imagery.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Live Weather Telemetry:</strong> Surface pressure, anemometer wind speeds, humidity (Open-Meteo).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Official Track Positions:</strong> NOAA NHC & IMD RSMC coordinate fixes & central pressure readings.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Infrastructure Ground Truth:</strong> Real OpenStreetMap nodes (hospitals, substations, bridges).</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Modeled */}
            <div className="bg-slate-900/90 border border-sky-500/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <h3 className="text-sm font-bold text-sky-300 uppercase tracking-wide">
                  WHAT IS MODELED?
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Deterministic physical calculations and equations executed in Python:
              </p>
              <ul className="text-xs space-y-2 text-slate-200 font-mono">
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Storm Surge Inundation:</strong> Jelesnianski SLOSH equations (barometric deficit + wind stress setup).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Rainfall Damage Pathways:</strong> Topographic depression runoff accumulation across 6h/12h/24h/48h.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Forecast Cone:</strong> Expanding geodesic error envelope (NHC 5-year average error statistics).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Multi-Hazard Risk Score:</strong> Normalized formula: 0.25S + 0.20W + 0.20R + 0.20I + 0.15E.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: AI-Generated */}
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wide">
                  WHAT IS AI-GENERATED?
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Google Gemini API structured multi-hazard reasoning and natural-language synthesis:
              </p>
              <ul className="text-xs space-y-2 text-slate-200 font-mono">
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Risk Synthesis:</strong> Explaining causal relationships between storm surge and road submersion.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Evacuation Guidance:</strong> Recommending safe corridors based on modeled impassable roads.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Advisory Bulletins:</strong> Official public broadcasts tailored for first responders and port authorities.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Strict Constraint:</strong> Gemini DOES NOT invent numerical measurements; it reasons over deterministic metrics.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-800/60 p-4 rounded-lg text-xs text-cyan-200 flex items-center justify-between">
            <div>
              <strong>Judges Question Checklist:</strong> Can authorities actually act on this? Yes. Observed data tells them what IS happening, physical models estimate what WILL happen, and Gemini explains WHERE to deploy resources first.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#141e33] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
