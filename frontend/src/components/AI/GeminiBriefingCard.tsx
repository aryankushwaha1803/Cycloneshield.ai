import React from 'react';
import { BrainCircuit, Cpu, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Key, FileText, ListChecks } from 'lucide-react';
import { AIAnalysisResponse } from '../../types';

interface GeminiBriefingCardProps {
  analysis: AIAnalysisResponse | null;
  isLoading: boolean;
  onRunAnalysis: () => void;
  geminiConfigured: boolean;
}

export const GeminiBriefingCard: React.FC<GeminiBriefingCardProps> = ({
  analysis,
  isLoading,
  onRunAnalysis,
  geminiConfigured,
}) => {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-950/70 border border-purple-500/50 rounded-lg text-purple-300">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gemini AI Disaster Intelligence Briefing
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-normal">
                gemini-2.5-flash
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Structured multi-hazard reasoning over deterministic inputs (zero fabricated numbers).
            </p>
          </div>
        </div>

        {/* Source Data Checklist */}
        <div className="flex items-center space-x-2 text-[10px] font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
          <span className="text-slate-500">Source Data:</span>
          <span className="text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Weather
          </span>
          <span className="text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Cyclone Track
          </span>
          <span className="text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Satellite
          </span>
          <span className="text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Infrastructure
          </span>
        </div>
      </div>

      {/* When Gemini is NOT configured */}
      {!geminiConfigured && (
        <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-6 text-center space-y-3">
          <Key className="w-8 h-8 text-purple-400 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-white">Gemini API Key Required for Live AI Reasoning</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Per strict real-data rules, CycloneShield does not fake AI answers. Connect your official Gemini API key to enable multimodal disaster briefings.
            </p>
          </div>
          <div className="text-[11px] font-mono text-purple-300 bg-purple-950/60 inline-block px-3 py-1 rounded border border-purple-800">
            Set GEMINI_API_KEY in backend/.env
          </div>
        </div>
      )}

      {/* When configured and analysis is available */}
      {geminiConfigured && analysis && (
        <div className="space-y-4 text-xs">
          {/* Risk Explanation */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-1.5">
            <div className="font-mono text-cyan-400 uppercase font-bold text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> 1. Expert Multi-Hazard Risk Explanation
            </div>
            <p className="text-slate-200 leading-relaxed font-sans text-[13px]">
              {analysis.risk_explanation}
            </p>
          </div>

          {/* Main Hazards Tags */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="font-mono text-amber-400 uppercase font-bold text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> 2. Primary Compound Hazards Identified
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.main_hazards.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex items-start space-x-2 text-slate-200 font-mono text-[11px]"
                >
                  <span className="text-red-400 font-bold">•</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Concerns & Evacuation Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="font-mono text-red-400 uppercase font-bold text-[11px]">
                3. Critical Infrastructure Concerns
              </div>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                {analysis.infrastructure_concerns.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-slate-950 p-2 rounded border border-slate-800/80">
                    <span className="text-red-400 font-bold">&gt;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="font-mono text-cyan-400 uppercase font-bold text-[11px]">
                4. Evacuation & Shelter Priorities
              </div>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                {analysis.evacuation_priorities.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-slate-950 p-2 rounded border border-slate-800/80">
                    <span className="text-cyan-400 font-bold">&gt;</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Preparedness Actions */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="font-mono text-emerald-400 uppercase font-bold text-[11px] flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" /> 5. Recommended Preparedness Actions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.recommended_preparedness_actions.map((act, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px]"
                >
                  <strong className="text-white block mb-0.5">Action {idx + 1}:</strong>
                  {act}
                </div>
              ))}
            </div>
          </div>

          {/* Early Warning Public Broadcast Advisory */}
          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-800/60 p-4 rounded-lg space-y-2">
            <div className="font-mono text-red-300 uppercase font-bold text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 6. Official Early-Warning Public Advisory Draft
              </span>
              <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
                BROADCAST READY
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200 font-serif leading-relaxed text-sm italic">
              "{analysis.early_warning_advisory}"
            </div>
          </div>

          {/* Data Uncertainty Explanation */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold uppercase">
              7. Data Uncertainty & Confidence Bounds
            </div>
            <p className="leading-relaxed">
              {analysis.data_uncertainty_explanation}
            </p>
          </div>
        </div>
      )}

      {/* Footer / Trigger */}
      {geminiConfigured && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            {analysis ? `Last Generated: ${new Date(analysis.timestamp).toLocaleTimeString()}` : 'Ready to execute reasoning'}
          </div>
          <button
            onClick={onRunAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reasoning with Gemini...' : 'Re-Run Gemini Analysis'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
