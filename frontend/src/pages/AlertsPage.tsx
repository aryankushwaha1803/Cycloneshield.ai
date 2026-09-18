import React, { useState, useEffect } from 'react';
import { AlertDispatchForm } from '../components/Alerts/AlertDispatchForm';
import { UserRole, AlertDispatchResponse } from '../types';
import { api } from '../services/api';
import { Bell, ShieldCheck, History, Radio } from 'lucide-react';

interface AlertsPageProps {
  userRole: UserRole;
  defaultMessage?: string;
  alertMode: 'LIVE' | 'SIMULATION';
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  userRole,
  defaultMessage,
  alertMode,
}) => {
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const records = await api.getAlertHistory();
      setHistory(records);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Dispatch Form Component */}
      <AlertDispatchForm
        userRole={userRole}
        defaultMessage={defaultMessage}
        alertMode={alertMode}
        onAlertDispatched={() => loadHistory()}
      />

      {/* Historical Audit Trail */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Official Early-Warning Broadcast Audit Log
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {history.length} Logged Warnings
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No emergency warnings broadcast yet in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-950/70">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Headline & Message</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Recipient Group</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">#{record.id}</td>
                    <td className="py-2.5 px-3 font-sans max-w-sm truncate text-white">
                      <strong>{record.title}</strong> — {record.message}
                    </td>
                    <td className="py-2.5 px-3">{record.channel}</td>
                    <td className="py-2.5 px-3 text-slate-400">{record.recipient_group}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          record.mode === 'LIVE'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {record.mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{record.provider}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(record.dispatched_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
