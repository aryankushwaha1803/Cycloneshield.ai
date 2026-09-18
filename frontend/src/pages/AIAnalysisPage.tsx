import React, { useState } from 'react';
import { GeminiBriefingCard } from '../components/AI/GeminiBriefingCard';
import { AIAnalysisResponse, CycloneData, RiskCalculationResponse } from '../types';
import { BrainCircuit, Upload, Image as ImageIcon, Send, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface AIAnalysisPageProps {
  cyclone: CycloneData | null;
  riskData: RiskCalculationResponse | null;
  analysis: AIAnalysisResponse | null;
  geminiConfigured: boolean;
  onAnalysisUpdated: (newAnalysis: AIAnalysisResponse) => void;
}

export const AIAnalysisPage: React.FC<AIAnalysisPageProps> = ({
  cyclone,
  riskData,
  analysis,
  geminiConfigured,
  onAnalysisUpdated,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetAudience, setTargetAudience] = useState<string>('PUBLIC');
  const [customAdvisory, setCustomAdvisory] = useState<string | null>(null);
  const [isGeneratingAdvisory, setIsGeneratingAdvisory] = useState<boolean>(false);

  const handleRunAnalysis = async () => {
    if (!cyclone) return;
    setIsLoading(true);
    try {
      const res = await api.runGeminiAnalysis(cyclone.storm_id);
      onAnalysisUpdated(res);
    } catch (err: any) {
      alert(`Gemini AI invocation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAdvisory = async () => {
    if (!cyclone) return;
    setIsGeneratingAdvisory(true);
    try {
      const res = await api.generateAdvisory(cyclone.storm_id, targetAudience);
      setCustomAdvisory(res.advisory);
    } catch (err: any) {
      alert(`Failed to generate advisory: ${err.message}`);
    } finally {
      setIsGeneratingAdvisory(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Main Gemini Structured Briefing Card */}
      <GeminiBriefingCard
        analysis={analysis}
        isLoading={isLoading}
        onRunAnalysis={handleRunAnalysis}
        geminiConfigured={geminiConfigured}
      />

      {/* Tailored Advisory Generator Grid */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Targeted Public & Inter-Agency Advisory Generator
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-300">
            Powered by Gemini
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 uppercase mb-1">Select Audience Profile</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="PUBLIC">General Public Broadcast</option>
              <option value="COASTAL_DISTRICTS">Coastal District Administrations</option>
              <option value="PORT_AUTHORITIES">Port & Maritime Authorities (Stage 4 Alert)</option>
              <option value="FIRST_RESPONDERS">NDRF & Disaster First Responders</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleGenerateAdvisory}
              disabled={isGeneratingAdvisory || !geminiConfigured}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
            >
              {isGeneratingAdvisory ? 'Synthesizing with Gemini...' : `Generate ${targetAudience} Advisory`}
            </button>
          </div>
        </div>

        {customAdvisory && (
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 animate-in fade-in">
            <div className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center justify-between">
              <span>Official Broadcast Draft for {targetAudience}</span>
              <span className="text-[10px] text-emerald-400">AUTHORIZED</span>
            </div>
            <p className="text-slate-200 text-sm italic font-serif leading-relaxed">
              "{customAdvisory}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
