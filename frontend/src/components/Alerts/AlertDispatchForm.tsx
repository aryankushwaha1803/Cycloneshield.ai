import React, { useState } from 'react';
import { Bell, Send, ShieldAlert, AlertTriangle, CheckCircle2, Lock, Radio } from 'lucide-react';
import { UserRole, AlertDispatchResponse } from '../../types';
import { api } from '../../services/api';

interface AlertDispatchFormProps {
  userRole: UserRole;
  defaultMessage?: string;
  onAlertDispatched: (resp: AlertDispatchResponse) => void;
  alertMode: 'LIVE' | 'SIMULATION';
}

export const AlertDispatchForm: React.FC<AlertDispatchFormProps> = ({
  userRole,
  defaultMessage = '',
  onAlertDispatched,
  alertMode,
}) => {
  const [title, setTitle] = useState('EMERGENCY CYCLONE WARNING: MANDATORY EVACUATION');
  const [message, setMessage] = useState(
    defaultMessage ||
      'Severe cyclonic storm approaching coastal sectors. Estimated peak surge 3.4m. Residents in Sector 1 lowlands must immediately evacuate to designated multi-purpose cyclone shelters.'
  );
  const [channel, setChannel] = useState('SMS');
  const [recipientGroup, setRecipientGroup] = useState('COASTAL_AUTHORITIES');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<AlertDispatchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canDispatch = userRole === 'ADMIN' || userRole === 'DISASTER_AUTHORITY';

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDispatch) return;

    setIsSending(true);
    setErrorMsg(null);
    try {
      const resp = await api.dispatchAlert(
        {
          title,
          message,
          recipient_group: recipientGroup,
          channel,
        },
        userRole
      );
      setLastResult(resp);
      onAlertDispatched(resp);
    } catch (err: any) {
      setErrorMsg(err.message || 'Dispatch failed.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-white">
            Emergency Early-Warning Dispatch Center
          </h3>
        </div>
        <div
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded border flex items-center gap-1.5 ${
            alertMode === 'LIVE'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-amber-950 text-amber-300 border-amber-800'
          }`}
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>GATEWAY: {alertMode}</span>
        </div>
      </div>

      {/* Authority Role Check Banner */}
      {!canDispatch && (
        <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-lg text-xs text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <div>
            <strong>Access Restricted:</strong> Current role <span className="font-mono underline font-bold">{userRole}</span> cannot broadcast alerts. Switch to <strong className="text-white">DISASTER_AUTHORITY</strong> or <strong className="text-white">ADMIN</strong> in the top header to dispatch.
          </div>
        </div>
      )}

      {/* Mode Transparency Banner */}
      {alertMode === 'SIMULATION' && (
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <div>
            <strong>Transparent Hackathon Notice:</strong> Twilio SMS credentials are not configured in <code className="text-cyan-300">backend/.env</code>. Alerts will be recorded in <strong className="text-amber-300">SIMULATION MODE ONLY</strong> and will never falsely claim SMS delivery.
          </div>
        </div>
      )}

      <form onSubmit={handleDispatch} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Channel */}
          <div>
            <label className="block font-mono uppercase text-slate-400 mb-1">
              Dispatch Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              disabled={!canDispatch}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="SMS">SMS (Twilio Programmable Messaging)</option>
              <option value="WEBHOOK">Emergency HTTP Webhook</option>
              <option value="EMAIL">Disaster Coordination Email (SMTP)</option>
              <option value="PUSH">Mobile Push Notification</option>
            </select>
          </div>

          {/* Recipient Group */}
          <div>
            <label className="block font-mono uppercase text-slate-400 mb-1">
              Target Recipient Directory
            </label>
            <select
              value={recipientGroup}
              onChange={(e) => setRecipientGroup(e.target.value)}
              disabled={!canDispatch}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="COASTAL_AUTHORITIES">Coastal District Magistrates & Ports</option>
              <option value="FIRST_RESPONDERS">NDRF & Coast Guard Command HQs</option>
              <option value="PUBLIC_BROADCAST">Civil Defense Emergency Broadcast</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block font-mono uppercase text-slate-400 mb-1">
            Broadcast Advisory Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canDispatch}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block font-mono uppercase text-slate-400 mb-1">
            Emergency Advisory Message Body
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!canDispatch}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-sans text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] font-mono text-slate-400">
            Dispatch Audit Tag: <span className="text-cyan-300 font-bold">{alertMode}</span>
          </div>

          <button
            type="submit"
            disabled={!canDispatch || isSending}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Transmitting Alert...' : `Dispatch Alert (${alertMode})`}</span>
          </button>
        </div>
      </form>

      {/* Result Notification */}
      {lastResult && (
        <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-lg text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">Alert Logged #{lastResult.alert_id} ({lastResult.mode} MODE)</div>
            <div className="text-[11px] text-emerald-300 mt-0.5">{lastResult.message}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Provider: {lastResult.provider} • Recipients: {lastResult.recipient_count} • Timestamp: {new Date(lastResult.dispatched_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/50 border border-red-800 p-3 rounded-lg text-xs text-red-200">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
    </div>
  );
};
