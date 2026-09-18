import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SituationReportResponse } from '../types';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<SituationReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const rep = await api.getSituationReport();
      setReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-400">
        Compiling official situation report from live telemetry...
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xl">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white font-mono">
            Executive Situation Report #{report.report_id}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Briefing</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-slate-200 font-sans print:bg-white print:text-black print:border-none">
        {/* Document Header */}
        <div className="border-b-2 border-cyan-500/50 pb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              GOVERNMENT DISASTER MANAGEMENT INTELLIGENCE BULLETIN
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              CYCLONESHIELD AI — SITUATION ASSESSMENT REPORT
            </h1>
            <div className="text-xs text-slate-400 font-mono mt-1">
              TARGET: <strong className="text-white">{report.cyclone_name}</strong> • ISSUED BY:{' '}
              <span className="text-cyan-300">{report.generated_by}</span>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="text-red-400 font-bold uppercase">{report.threat_status}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">
              Generated: {new Date(report.generated_at).toUTCString()}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Threat Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <span className="text-cyan-400">1.0</span> Meteorological Telemetry
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs bg-slate-950/60 p-3 rounded border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px]">Classification</span>
              <div className="font-bold text-white">{report.meteorological_summary.category}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Peak Sustained Wind</span>
              <div className="font-bold text-white">{report.meteorological_summary.sustained_wind_kmh} km/h</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Minimum Central Pressure</span>
              <div className="font-bold text-amber-300">{report.meteorological_summary.central_pressure_hpa} hPa</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Landfall Trajectory</span>
              <div className="font-bold text-white">{report.meteorological_summary.landfall_trajectory}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Hydrodynamic Storm Surge */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <span className="text-sky-400">2.0</span> Modeled Hydrodynamic Storm Surge Extent
          </h3>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs bg-slate-950/60 p-3 rounded border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px]">Modeled Peak Surge</span>
              <div className="font-bold text-sky-400 text-base">{report.surge_and_flood_summary.modeled_peak_surge_m} m</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Inundation Area</span>
              <div className="font-bold text-white text-base">{report.surge_and_flood_summary.inundation_area_km2} km²</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Coastal Penetration</span>
              <div className="font-bold text-white text-base">~{report.surge_and_flood_summary.coastal_penetration_km} km</div>
            </div>
          </div>
        </div>

        {/* Section 3: Critical Infrastructure Exposure */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <span className="text-amber-400">3.0</span> Critical Infrastructure & Accessibility Impact
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            OpenStreetMap Overpass analysis flags <strong className="text-amber-300">{report.infrastructure_impact_summary.critical_facilities_at_risk} critical facilities</strong> (district hospitals, cyclone shelters, and power grid substations) directly within the modeled surge and flood impact zones. Arterial road accessibility is evaluated as <strong className="text-red-400">{report.infrastructure_impact_summary.road_vulnerability_level}</strong> with approximately {report.infrastructure_impact_summary.submerged_culverts_est} submerged road culverts.
          </p>
        </div>

        {/* Section 4: Evacuation Priority Sectors */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <span className="text-red-400">4.0</span> Evacuation Priorities & Sector Triage
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {report.evacuation_summary.sectors?.map((sec: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-bold text-white">{sec.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">Pop: {sec.population.toLocaleString()}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      sec.priority === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : sec.priority === 'HIGH'
                        ? 'bg-orange-950 text-orange-300 border-orange-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {sec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Official Public Advisory */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <span className="text-emerald-400">5.0</span> Official Public Broadcast Advisory Text
          </h3>
          <div className="bg-slate-950 p-4 rounded border border-slate-800 text-slate-100 font-serif italic text-sm leading-relaxed">
            "{report.official_advisory}"
          </div>
        </div>

        {/* Signoff */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>Verified Deterministic Model Formulation</div>
          <div>Report Signoff: Operations Room Controller</div>
        </div>
      </div>
    </div>
  );
};
