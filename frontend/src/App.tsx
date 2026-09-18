import React, { useState, useEffect } from 'react';
import { Header } from './components/Common/Header';
import { DemoBanner } from './components/Common/DemoBanner';
import { DataStatusModal } from './components/Common/DataStatusModal';
import { HowItWorksModal } from './components/Transparency/HowItWorksModal';
import { LaunchLiveAnalysisModal } from './components/Dashboard/LaunchLiveAnalysisModal';
import { LandingPage } from './pages/LandingPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { CycloneTrackPage } from './pages/CycloneTrackPage';
import { ImpactSimulationPage } from './pages/ImpactSimulationPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import {
  CycloneData,
  HistoricalCycloneItem,
  WeatherCurrent,
  WeatherForecast,
  RiskCalculationResponse,
  InfrastructureAsset,
  SatelliteLayer,
  DataSourceStatus,
  AIAnalysisResponse,
  UserRole,
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [userRole, setUserRole] = useState<UserRole>('DISASTER_AUTHORITY');

  // Application Data States
  const [cyclone, setCyclone] = useState<CycloneData | null>(null);
  const [historicalList, setHistoricalList] = useState<HistoricalCycloneItem[]>([]);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [riskData, setRiskData] = useState<RiskCalculationResponse | null>(null);
  const [infrastructure, setInfrastructure] = useState<InfrastructureAsset[]>([]);
  const [satelliteLayers, setSatelliteLayers] = useState<SatelliteLayer[]>([]);
  const [services, setServices] = useState<DataSourceStatus[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);

  // Modals
  const [isDataStatusOpen, setIsDataStatusOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLiveRunnerOpen, setIsLiveRunnerOpen] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // 1. Fetch system status
      const statusRes = await api.getSystemStatus();
      setServices(statusRes.services);

      // 2. Fetch historical catalog
      const hist = await api.getHistoricalCyclones();
      setHistoricalList(hist);

      // 3. Fetch current cyclone
      const cyc = await api.getCurrentCyclone();
      setCyclone(cyc);

      // 4. Fetch weather for cyclone coordinate
      const curr = cyc.current_position;
      const [weath, fore, infra, sats, risk] = await Promise.all([
        api.getCurrentWeather(curr.latitude, curr.longitude),
        api.getWeatherForecast(curr.latitude, curr.longitude),
        api.getInfrastructure(),
        api.getSatelliteLayers(curr.latitude, curr.longitude),
        api.calculateRisk(),
      ]);

      setWeather(weath);
      setForecast(fore);
      setInfrastructure(infra);
      setSatelliteLayers(sats);
      setRiskData(risk);
    } catch (err) {
      console.error('Initial data loading error:', err);
    }
  };

  const handleSelectCyclone = async (stormId: string) => {
    try {
      const cyc = await api.selectCyclone(stormId);
      setCyclone(cyc);
      const curr = cyc.current_position;

      const [weath, fore, sats, risk] = await Promise.all([
        api.getCurrentWeather(curr.latitude, curr.longitude),
        api.getWeatherForecast(curr.latitude, curr.longitude),
        api.getSatelliteLayers(curr.latitude, curr.longitude),
        api.calculateRisk(),
      ]);

      setWeather(weath);
      setForecast(fore);
      setSatelliteLayers(sats);
      setRiskData(risk);
      setAnalysis(null); // Reset AI analysis for newly selected storm
    } catch (err) {
      console.error('Error selecting cyclone:', err);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const res = await api.getSystemStatus();
      setServices(res.services);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const geminiConfigured = services.some(
    (s) => s.service_key === 'gemini' && s.status === 'CONNECTED'
  );

  const alertMode =
    services.find((s) => s.service_key === 'alerts')?.status === 'CONNECTED'
      ? 'LIVE'
      : 'SIMULATION';

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        currentCyclone={cyclone}
        historicalList={historicalList}
        onSelectCyclone={handleSelectCyclone}
        onOpenDataStatus={() => setIsDataStatusOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenLiveRunner={() => setIsLiveRunnerOpen(true)}
        services={services}
      />

      {/* Demo / Simulation Mode Warning Banner */}
      <DemoBanner
        services={services}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Page Content Router */}
      <main className="flex-1 pb-10">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterCommandCenter={() => setActiveTab('command-center')}
            onOpenLiveRunner={() => setIsLiveRunnerOpen(true)}
            currentCyclone={cyclone}
            historicalList={historicalList}
            onSelectCyclone={handleSelectCyclone}
          />
        )}

        {activeTab === 'command-center' && (
          <CommandCenterPage
            cyclone={cyclone}
            weather={weather}
            forecast={forecast}
            riskData={riskData}
            infrastructure={infrastructure}
            satelliteLayers={satelliteLayers}
          />
        )}

        {activeTab === 'cyclone' && (
          <CycloneTrackPage
            cyclone={cyclone}
            historicalList={historicalList}
            onSelectCyclone={handleSelectCyclone}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactSimulationPage
            cyclone={cyclone}
            riskData={riskData}
            onRiskUpdated={(newRisk) => setRiskData(newRisk)}
          />
        )}

        {activeTab === 'infrastructure' && (
          <InfrastructurePage infrastructure={infrastructure} />
        )}

        {activeTab === 'ai-analysis' && (
          <AIAnalysisPage
            cyclone={cyclone}
            riskData={riskData}
            analysis={analysis}
            geminiConfigured={geminiConfigured}
            onAnalysisUpdated={(newAn) => setAnalysis(newAn)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPage
            userRole={userRole}
            defaultMessage={analysis?.early_warning_advisory}
            alertMode={alertMode}
          />
        )}

        {activeTab === 'reports' && <ReportsPage />}

        {activeTab === 'settings' && (
          <SettingsPage
            services={services}
            onRefresh={handleRefreshStatus}
            isRefreshing={isRefreshingStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070b14] py-4 px-6 text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between gap-2">
        <div>
          CYCLONESHIELD AI &copy; 2026 • Real-Data Disaster Intelligence Platform
        </div>
        <div className="flex items-center space-x-4">
          <span>Data Provenance: Strict Enforcement</span>
          <span>FastAPI + PyTorch/SLOSH + Leaflet + Gemini AI</span>
        </div>
      </footer>

      {/* Persistent Modals */}
      <DataStatusModal
        isOpen={isDataStatusOpen}
        onClose={() => setIsDataStatusOpen(false)}
        services={services}
        onRefresh={handleRefreshStatus}
        isRefreshing={isRefreshingStatus}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <LaunchLiveAnalysisModal
        isOpen={isLiveRunnerOpen}
        onClose={() => setIsLiveRunnerOpen(false)}
        onComplete={({ cyclone: c, risk: r, ai: a }) => {
          setCyclone(c);
          setRiskData(r);
          if (a) setAnalysis(a);
          setActiveTab('command-center');
        }}
      />
    </div>
  );
};

export default App;
