import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { DataSourceStatus } from '../../types';

interface DemoBannerProps {
  services: DataSourceStatus[];
  onOpenSettings: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ services, onOpenSettings }) => {
  const unavailableOrUnconfigured = services.filter((s) => s.status !== 'CONNECTED');

  if (unavailableOrUnconfigured.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-950/90 border-b border-amber-600/50 text-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
        <span className="font-bold tracking-wide text-amber-300">
          ⚠ DEMO / SIMULATION FALLBACK DETECTED:
        </span>
        <span className="text-amber-100/90">
          Live external credentials missing for specific modules. Unconnected components are strictly labeled as simulated:
        </span>
        <div className="flex flex-wrap gap-1.5 ml-2">
          {unavailableOrUnconfigured.map((s) => (
            <span
              key={s.service_key}
              className="bg-amber-900/80 text-amber-200 px-1.5 py-0.5 rounded border border-amber-700/60 font-mono text-[10px]"
            >
              {s.display_name.split(' ')[0]}: <strong className="text-amber-300">{s.status}</strong>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={onOpenSettings}
        className="flex items-center space-x-1 text-amber-300 hover:text-amber-100 underline font-semibold transition-colors flex-shrink-0"
      >
        <span>Configure Credentials</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};
