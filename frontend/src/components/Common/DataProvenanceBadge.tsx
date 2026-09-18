import React from 'react';
import { Database, ShieldCheck, Cpu, Compass } from 'lucide-react';

interface DataProvenanceBadgeProps {
  source: string;
  dataset?: string;
  timestamp?: string;
  dataType?: 'OBSERVED' | 'MODELED' | 'AI-GENERATED' | 'GOV_ARCHIVE';
  className?: string;
}

export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({
  source,
  dataset,
  timestamp,
  dataType = 'OBSERVED',
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (dataType) {
      case 'OBSERVED':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80';
      case 'MODELED':
        return 'bg-sky-950/70 text-sky-400 border-sky-800/80';
      case 'AI-GENERATED':
        return 'bg-purple-950/70 text-purple-300 border-purple-800/80';
      case 'GOV_ARCHIVE':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/80';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const getIcon = () => {
    switch (dataType) {
      case 'OBSERVED':
        return <Compass className="w-3 h-3 mr-1 text-emerald-400" />;
      case 'MODELED':
        return <Database className="w-3 h-3 mr-1 text-sky-400" />;
      case 'AI-GENERATED':
        return <Cpu className="w-3 h-3 mr-1 text-purple-300" />;
      case 'GOV_ARCHIVE':
        return <ShieldCheck className="w-3 h-3 mr-1 text-amber-300" />;
    }
  };

  return (
    <div
      className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border ${getBadgeStyle()} ${className}`}
      title={`Data Provenance: ${source} | ${dataset || ''}`}
    >
      {getIcon()}
      <span className="font-semibold uppercase tracking-wider mr-1.5">{dataType}</span>
      <span className="text-slate-300 border-l border-slate-700 pl-1.5 truncate max-w-[200px]">
        {source}
      </span>
      {dataset && (
        <span className="text-slate-400 border-l border-slate-700 pl-1.5 hidden sm:inline truncate max-w-[150px]">
          {dataset}
        </span>
      )}
      {timestamp && (
        <span className="text-slate-400 border-l border-slate-700 pl-1.5 hidden md:inline">
          {timestamp}
        </span>
      )}
    </div>
  );
};
