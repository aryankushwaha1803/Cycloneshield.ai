import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Radio, Server, Clock, Key } from 'lucide-react';
import { DataSourceStatus } from '../../types';

interface DataStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: DataSourceStatus[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DataStatusModal: React.FC<DataStatusModalProps> = ({
  isOpen,
  onClose,
  services,
  onRefresh,
  isRefreshing,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(services[0]?.service_key || 'weather');

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.service_key === selectedKey) || services[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#141e33]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-500/50 rounded-lg text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Live Data Status Center
                <span className="text-xs font-mono font-normal bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                  REAL-TIME TELEMETRY AUDIT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Judges Transparency Panel verifying live connections, endpoints, and credentials.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Ping All</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Service List */}
          <div className="md:col-span-5 border-r border-slate-800/80 p-4 space-y-2 overflow-y-auto bg-[#0b1324]/50">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">
              Data Feeds & Subsystems
            </div>
            {services.map((service) => {
              const isSelected = service.service_key === selectedKey;
              const isConnected = service.status === 'CONNECTED';
              return (
                <button
                  key={service.service_key}
                  onClick={() => setSelectedKey(service.service_key)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="relative flex h-3 w-3 flex-shrink-0">
                      {isConnected ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </>
                      ) : service.status === 'NOT_CONFIGURED' ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      ) : (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      )}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">
                        {service.display_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {service.provider_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border ml-2 flex-shrink-0">
                    {service.status === 'CONNECTED' ? (
                      <span className="text-emerald-400 bg-emerald-950/40 border-emerald-800/60">LIVE</span>
                    ) : service.status === 'NOT_CONFIGURED' ? (
                      <span className="text-amber-400 bg-amber-950/40 border-amber-800/60">CONFIG REQ</span>
                    ) : (
                      <span className="text-red-400 bg-red-950/40 border-red-800/60">OFFLINE</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Inspector */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-[#0f172a]">
            {selectedService && (
              <>
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedService.display_name}
                      {selectedService.status === 'CONNECTED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Service Key: <span className="text-cyan-300">{selectedService.service_key}</span>
                    </p>
                  </div>
                  <div
                    className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold border ${
                      selectedService.status === 'CONNECTED'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : selectedService.status === 'NOT_CONFIGURED'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}
                  >
                    ● {selectedService.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
                      <Server className="w-3 h-3 text-cyan-400" /> Active Provider
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">
                      {selectedService.provider_name}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Latency / Ping
                    </div>
                    <div className="text-xs font-mono font-semibold text-cyan-300 mt-1">
                      {selectedService.latency_ms.toFixed(1)} ms
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">
                    Endpoint URL / Protocol
                  </div>
                  <div className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 break-all">
                    {selectedService.endpoint_url}
                  </div>
                </div>

                {selectedService.details && Object.keys(selectedService.details).length > 0 && (
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">
                      Telemetry Metadata & Details
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                      {Object.entries(selectedService.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-slate-800/60 pb-1">
                          <span className="text-slate-400">{k}:</span>
                          <span className="text-white text-right max-w-[280px] truncate">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedService.last_error && (
                  <div className="bg-red-950/50 p-3.5 rounded-lg border border-red-800/60 text-xs text-red-200">
                    <div className="font-bold text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Error Diagnostic
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-red-300">
                      {selectedService.last_error}
                    </div>
                  </div>
                )}

                {selectedService.status !== 'CONNECTED' && (
                  <div className="bg-cyan-950/40 p-4 rounded-lg border border-cyan-800/60 text-xs text-cyan-200">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Key className="w-4 h-4" /> Setup Instructions
                    </div>
                    <p className="mt-1.5 text-slate-300 leading-relaxed">
                      {selectedService.details?.setup_guide ||
                        'Add credentials in backend/.env to transition this subsystem from Simulation to Live Data mode.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#141e33] flex items-center justify-between text-xs text-slate-400">
          <div>
            Data Integrity Rule: <span className="text-emerald-400 font-semibold">Strict Provenance Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
