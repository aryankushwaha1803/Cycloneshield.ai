import React, { useState } from 'react';
import { Building2, Shield, Zap, Radio, AlertTriangle, ExternalLink, Filter } from 'lucide-react';
import { InfrastructureAsset } from '../types';
import { DataProvenanceBadge } from '../components/Common/DataProvenanceBadge';

interface InfrastructurePageProps {
  infrastructure: InfrastructureAsset[];
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({ infrastructure }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filteredAssets =
    selectedFilter === 'ALL'
      ? infrastructure
      : infrastructure.filter((a) => a.asset_type.toLowerCase() === selectedFilter.toLowerCase());

  const getAssetBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'shelter':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'bridge':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'power_substation':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
            OPENSTREETMAP GEOSPATIAL ASSETS
          </div>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Critical Infrastructure Exposure & Vulnerability Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real/open geospatial nodes queried via OpenStreetMap Overpass API and regional coastal databases.
          </p>
        </div>
        <DataProvenanceBadge source="OpenStreetMap Overpass" dataType="OBSERVED" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-slate-800 p-3 rounded-xl">
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            { id: 'ALL', label: `All Facilities (${infrastructure.length})` },
            { id: 'hospital', label: 'Hospitals' },
            { id: 'shelter', label: 'Cyclone Shelters' },
            { id: 'bridge', label: 'Bridges & Culverts' },
            { id: 'power_substation', label: 'Power Grid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                selectedFilter === tab.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/80 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{filteredAssets.length}</span> matching assets
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-950/70">
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Elevation</th>
                <th className="py-3 px-4">Coast Proximity</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Vulnerability Hazards</th>
                <th className="py-3 px-4">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-bold text-white font-sans text-xs">
                    {a.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getAssetBadge(a.asset_type)}`}>
                      {a.asset_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {a.latitude.toFixed(4)}°N, {a.longitude.toFixed(4)}°E
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {a.elevation_m} m
                  </td>
                  <td className="py-3 px-4">
                    <span className={a.distance_to_coast_km < 3 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {a.distance_to_coast_km} km
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {a.capacity > 0 ? `${a.capacity.toLocaleString()} persons` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {a.hazards.map((h, i) => (
                        <span key={i} className="text-[9px] bg-red-950/60 text-red-300 px-1.5 py-0.5 rounded border border-red-800/50">
                          {h}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[10px] text-slate-400">
                    {a.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
