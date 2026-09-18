import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Sparkles,
  Radio,
  HelpCircle,
  ChevronDown,
  UserCheck,
  Calendar,
  Layers,
  FileText,
  Bell,
  Sliders,
  Compass,
  Building2,
  BrainCircuit
} from 'lucide-react';
import { UserRole, CycloneData, HistoricalCycloneItem, DataSourceStatus } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentCyclone: CycloneData | null;
  historicalList: HistoricalCycloneItem[];
  onSelectCyclone: (stormId: string) => void;
  onOpenDataStatus: () => void;
  onOpenHowItWorks: () => void;
  onOpenLiveRunner: () => void;
  services: DataSourceStatus[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  currentCyclone,
  historicalList,
  onSelectCyclone,
  onOpenDataStatus,
  onOpenHowItWorks,
  onOpenLiveRunner,
  services,
}) => {
  const [isStormMenuOpen, setIsStormMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const isAllConnected = services.every((s) => s.status === 'CONNECTED');

  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'cyclone', label: 'Cyclone Track', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'impact', label: 'Surge & Rain Simulation', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'ai-analysis', label: 'Gemini AI Analysis', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { id: 'alerts', label: 'Early Warning', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Situation Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Data Sources & API', icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  const roles: UserRole[] = ['DISASTER_AUTHORITY', 'ADMIN', 'FIELD_OPERATOR', 'VIEWER'];

  return (
    <header className="bg-[#0b1324] border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner Row */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0e172a]">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg text-slate-950 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-white font-mono">
                CYCLONESHIELD<span className="text-cyan-400">.AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 rounded">
                PROTOTYPE v1.0
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-medium">
              Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster
            </div>
          </div>
        </div>

        {/* Middle: Active Target Selector & Status */}
        <div className="flex items-center space-x-2">
          {/* Active Storm Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStormMenuOpen(!isStormMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono transition shadow-sm"
            >
              <span className="text-slate-400">Target Storm:</span>
              <span className="font-bold text-cyan-300">
                {currentCyclone?.name || 'Loading...'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentCyclone?.year || '2023'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStormMenuOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-[#0f172a] border border-cyan-500/40 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Official Cyclone Catalog</span>
                  <span className="text-emerald-400">VERIFIED DATA</span>
                </div>
                <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                  {historicalList.map((storm) => (
                    <button
                      key={storm.storm_id}
                      onClick={() => {
                        onSelectCyclone(storm.storm_id);
                        setIsStormMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        currentCyclone?.storm_id === storm.storm_id
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{storm.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {storm.basin} ({storm.year})
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {storm.max_wind_kmh} km/h
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Indicator */}
          <button
            onClick={onOpenDataStatus}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono transition"
            title="Inspect Live Data Status Center"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold hidden sm:inline">LIVE DATA</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400 ml-1" />
          </button>
        </div>

        {/* Right Tools & Role */}
        <div className="flex items-center space-x-2">
          {/* Launch Live Analysis CTA */}
          <button
            onClick={onOpenLiveRunner}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Launch Live Analysis</span>
          </button>

          {/* Transparency Panel Button */}
          <button
            onClick={onOpenHowItWorks}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg transition"
            title="Judges Transparency & Taxonomy Panel"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">How This Works</span>
          </button>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs rounded-lg transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-amber-300 font-semibold hidden sm:inline">
                {userRole.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl z-50 p-1.5 text-xs">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  Switch Authority Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      userRole === r ? 'bg-amber-950/60 text-amber-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{r.replace('_', ' ')}</span>
                    {userRole === r && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-4 flex items-center space-x-1 overflow-x-auto scrollbar-none py-1.5 bg-[#0b1324]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
