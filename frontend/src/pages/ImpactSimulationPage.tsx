import React, { useState } from 'react';
import { Waves, CloudRain, Sliders, RefreshCw, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { CycloneData, RiskCalculationResponse } from '../types';
import { DataProvenanceBadge } from '../components/Common/DataProvenanceBadge';
import { api } from '../services/api';

interface ImpactSimulationPageProps {
  cyclone: CycloneData | null;
  riskData: RiskCalculationResponse | null;
  onRiskUpdated: (newRisk: RiskCalculationResponse) => void;
}

export const ImpactSimulationPage: React.FC<ImpactSimulationPageProps> = ({
  cyclone,
  riskData,
  onRiskUpdated,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'6h_mm' | '12h_mm' | '24h_mm' | '48h_mm'>('24h_mm');
  const [windDelta, setWindDelta] = useState<number>(0);
  const [pressureDelta, setPressureDelta] = useState<number>(0);
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  if (!riskData || !cyclone) return null;

  const surge = riskData.storm_surge;
  const pathways = riskData.rainfall_pathways;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const updated = await api.simulateRisk({
        storm_id: cyclone.storm_id,
        wind_speed_delta_kmh: windDelta,
        pressure_delta_hpa: pressureDelta,
        rainfall_multiplier: rainMultiplier,
      });
      onRiskUpdated(updated);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    setWindDelta(0);
    setPressureDelta(0);
    setRainMultiplier(1.0);
    setIsSimulating(true);
    try {
      const reset = await api.calculateRisk();
      onRiskUpdated(reset);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
            HYDRODYNAMIC & PRECIPITATION ENGINE
          </div>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Physical Impact & Compound Vulnerability Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explainable storm-surge estimation using Jelesnianski SLOSH equations and topographic runoff accumulation.
          </p>
        </div>
        <DataProvenanceBadge source="SLOSH Hydrodynamic Model" dataType="MODELED" />
      </div>

      {/* Grid: Storm Surge (Left) & Rainfall Pathways (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storm Surge Panel */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Waves className="w-5 h-5 text-sky-400" /> Modeled Storm-Surge Risk
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                PHYSICAL FORMULATION
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Estimated Peak Surge</span>
                <div className="text-3xl font-extrabold text-sky-400">
                  {surge.estimated_surge_m.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400 font-sans">m</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Barometric: +{surge.barometric_component_m}m • Wind: +{surge.wind_stress_component_m}m
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Coastal Inundation Area</span>
                <div className="text-3xl font-extrabold text-white">
                  {surge.affected_area_km2}{' '}
                  <span className="text-xs font-normal text-slate-400 font-sans">km²</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  ~{surge.coastal_penetration_km} km penetration depth
                </div>
              </div>
            </div>

            {/* Model Inputs Table */}
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg space-y-2 text-xs font-mono">
              <div className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-800 pb-1">
                Model Inputs & Boundary Parameters
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 text-slate-300">
                <div className="flex justify-between pr-2">
                  <span className="text-slate-400">Wind Velocity:</span>
                  <span className="text-white font-bold">{cyclone.current_position.wind_speed_kmh} km/h</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-400">Pressure Deficit:</span>
                  <span className="text-amber-300 font-bold">{(1013.25 - cyclone.current_position.pressure_hpa).toFixed(1)} hPa</span>
                </div>
                <div className="flex justify-between pr-2">
                  <span className="text-slate-400">Shelf Width:</span>
                  <span className="text-white font-bold">{surge.shelf_width_km} km</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-400">Shoaling Factor:</span>
                  <span className="text-white font-bold">{surge.shoaling_factor}x</span>
                </div>
              </div>
            </div>

            {/* Mathematical Transparency Equation */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-sky-300 space-y-1">
              <div className="text-[10px] uppercase text-slate-400">Surge Calculation Equation</div>
              <div className="text-slate-200">
                ΔH = 0.0104 × (1013.25 - P_c) + [ (C_d · ρ_a · V² · L) / (g · ρ_w · D) ] × cos(θ) × γ_shoal
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 italic">
            * MODELED STORM-SURGE RISK: Physically reproducible estimation. Not an official astronomical tide prediction.
          </div>
        </div>

        {/* Rainfall Damage Pathways Panel */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-purple-400" /> Rainfall Damage Pathways
              </h3>
              {/* Horizon Selector */}
              <div className="flex space-x-1 font-mono text-[10px]">
                {(['6h_mm', '12h_mm', '24h_mm', '48h_mm'] as const).map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setSelectedHorizon(hz)}
                    className={`px-2 py-0.5 rounded transition border ${
                      selectedHorizon === hz
                        ? 'bg-purple-950 text-purple-300 border-purple-600 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {hz.replace('_mm', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Selected Horizon Rain</span>
                <div className="text-3xl font-extrabold text-purple-300">
                  {pathways.horizons[selectedHorizon]}{' '}
                  <span className="text-xs font-normal text-slate-400 font-sans">mm</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Total cumulative precipitation
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Road Network Status</span>
                <div className="text-2xl font-extrabold text-amber-300">
                  {pathways.road_vulnerability_status}
                </div>
                <div className="text-[10px] text-slate-400">
                  ~{pathways.submerged_road_culverts_est} culverts submerged
                </div>
              </div>
            </div>

            {/* Runoff Chain */}
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg space-y-2 text-xs font-mono">
              <div className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-800 pb-1">
                Causal Damage Pathway Chain
              </div>
              <div className="space-y-1.5 text-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>1. Extreme precipitation rates over coastal catchments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>2. Low topographic elevation (&lt;5m) impedes gravity discharge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>3. Localized depression water accumulation: ~{pathways.depression_accumulation_cm} cm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>4. Primary arterial road submersion & hospital access disruption</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-purple-300">
              Drainage Pathway: {pathways.hydrological_pathway}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 italic">
            * Clearly distinguished: Numerical rainfall (Observed/Forecast NWP), Depression accumulation (Modeled).
          </div>
        </div>
      </div>

      {/* Sensitivity "What-If" Scenario Simulator */}
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Interactive "What-If" Sensitivity Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Deterministic Parameter Stress-Testing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          {/* Wind Delta Slider */}
          <div className="space-y-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Wind Speed Delta:</span>
              <span className="text-cyan-300 font-bold">
                {windDelta >= 0 ? `+${windDelta}` : windDelta} km/h
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="50"
              step="5"
              value={windDelta}
              onChange={(e) => setWindDelta(parseInt(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-40 km/h</span>
              <span>Baseline</span>
              <span>+50 km/h</span>
            </div>
          </div>

          {/* Pressure Delta Slider */}
          <div className="space-y-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Central Pressure Delta:</span>
              <span className="text-amber-300 font-bold">
                {pressureDelta >= 0 ? `+${pressureDelta}` : pressureDelta} hPa
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="20"
              step="2"
              value={pressureDelta}
              onChange={(e) => setPressureDelta(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-30 hPa (Stronger)</span>
              <span>Baseline</span>
              <span>+20 hPa</span>
            </div>
          </div>

          {/* Rainfall Multiplier Slider */}
          <div className="space-y-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Rainfall Multiplier:</span>
              <span className="text-purple-300 font-bold">{rainMultiplier.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={rainMultiplier}
              onChange={(e) => setRainMultiplier(parseFloat(e.target.value))}
              className="w-full accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.5x</span>
              <span>1.0x (NWP Base)</span>
              <span>2.5x</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition"
          >
            Reset to Authoritative Baseline
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Physics...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
