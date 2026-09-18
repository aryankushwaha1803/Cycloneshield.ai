import React from 'react';
import { X, Calculator, ShieldAlert, BarChart3, Info } from 'lucide-react';
import { RiskCalculationResponse } from '../../types';

interface RiskScoreExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  riskData: RiskCalculationResponse | null;
}

export const RiskScoreExplainer: React.FC<RiskScoreExplainerProps> = ({
  isOpen,
  onClose,
  riskData,
}) => {
  if (!isOpen || !riskData) return null;

  const bd = riskData.factor_breakdown;

  const factors = [
    {
      name: 'Storm Surge Inundation',
      weight: bd.surge_weight,
      score: bd.surge_score,
      contribution: bd.surge_score * bd.surge_weight,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      description: `Modeled peak surge of ${riskData.storm_surge.estimated_surge_m.toFixed(1)} m based on central pressure deficit & wind stress.`,
      severity: bd.surge_score > 70 ? 'CRITICAL' : bd.surge_score > 40 ? 'HIGH' : 'MODERATE',
    },
    {
      name: 'Extreme Wind Field',
      weight: bd.wind_weight,
      score: bd.wind_score,
      contribution: bd.wind_score * bd.wind_weight,
      color: 'bg-red-500',
      textColor: 'text-red-400',
      description: 'Max sustained gale/storm wind speeds exceeding threshold limits.',
      severity: bd.wind_score > 70 ? 'CRITICAL' : bd.wind_score > 40 ? 'HIGH' : 'MODERATE',
    },
    {
      name: '24h Precipitation & Runoff',
      weight: bd.rain_weight,
      score: bd.rain_score,
      contribution: bd.rain_score * bd.rain_weight,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      description: `Runoff accumulation in low-lying depressions (${riskData.rainfall_pathways.depression_accumulation_cm} cm water depth).`,
      severity: bd.rain_score > 70 ? 'CRITICAL' : bd.rain_score > 40 ? 'HIGH' : 'MODERATE',
    },
    {
      name: 'Critical Infrastructure Exposure',
      weight: bd.infra_weight,
      score: bd.infra_score,
      contribution: bd.infra_score * bd.infra_weight,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      description: `${riskData.critical_infrastructure_exposed} critical hospitals, bridges, and power grid nodes within hazard envelope.`,
      severity: bd.infra_score > 70 ? 'CRITICAL' : bd.infra_score > 40 ? 'HIGH' : 'MODERATE',
    },
    {
      name: 'Demographic Population Exposure',
      weight: bd.exposure_weight,
      score: bd.exposure_score,
      contribution: bd.exposure_score * bd.exposure_weight,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      description: `${riskData.exposed_population.toLocaleString()} coastal residents residing in Sector 1 & Sector 2 impact corridors.`,
      severity: bd.exposure_score > 70 ? 'CRITICAL' : bd.exposure_score > 40 ? 'HIGH' : 'MODERATE',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#141e33]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-500/50 rounded-lg text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Why is this Score {bd.overall_score.toFixed(0)}?
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-normal">
                  DETERMINISTIC FORMULA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Factor decomposition and weighted contribution analysis for judges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Display Box */}
        <div className="px-6 pt-5 pb-2">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-xs text-cyan-300 space-y-1">
            <div className="text-[10px] uppercase text-slate-400">Deterministic Mathematical Formulation</div>
            <div className="text-slate-100 font-semibold">{bd.formula_display}</div>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            {factors.map((f) => (
              <div
                key={f.name}
                className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${f.color}`} />
                    <span className="font-bold text-white">{f.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      (Weight: {(f.weight * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold">
                      {f.severity}
                    </span>
                    <span className={`font-bold ${f.textColor}`}>
                      +{f.contribution.toFixed(1)} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 leading-snug">
                  {f.description}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cyan-950/30 border border-cyan-800/50 p-3 rounded-lg text-xs text-cyan-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Judges Defensibility:</strong> Risk scores are strictly deterministic and reproducible. Gemini AI does not calculate or guess these numbers; it reasons over them to formulate response plans.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#141e33] flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Total Composite Score:{' '}
            <strong className="text-white text-sm">{bd.overall_score.toFixed(1)} / 100</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
