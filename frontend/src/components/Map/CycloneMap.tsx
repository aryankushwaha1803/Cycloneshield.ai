import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  CycloneData,
  InfrastructureAsset,
  RiskCalculationResponse,
  SatelliteLayer,
  EvacuationZone
} from '../../types';
import { DataProvenanceBadge } from '../Common/DataProvenanceBadge';
import { Shield, Building2, Zap, Radio, AlertTriangle, Layers, Crosshair } from 'lucide-react';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons for Leaflet
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: white;
      ">${label}</div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

const stormCenterIcon = L.divIcon({
  className: 'storm-eye-icon',
  html: `
    <div style="position: relative; width: 36px; height: 36px;">
      <div style="position: absolute; inset: 0; background: rgba(239,68,68,0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; inset: 4px; background: #dc2626; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(239,68,68,0.9);">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to dynamically re-center map when storm changes
const RecenterView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7);
  }, [center, map]);
  return null;
};

interface CycloneMapProps {
  cyclone: CycloneData | null;
  riskData: RiskCalculationResponse | null;
  infrastructure: InfrastructureAsset[];
  satelliteLayers?: SatelliteLayer[];
  onSelectEvacuationZone?: (zone: EvacuationZone) => void;
  selectedEvacuationZone?: EvacuationZone | null;
}

export const CycloneMap: React.FC<CycloneMapProps> = ({
  cyclone,
  riskData,
  infrastructure,
  satelliteLayers = [],
  onSelectEvacuationZone,
  selectedEvacuationZone,
}) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<'carto' | 'satellite' | 'opentopo'>('carto');
  const [showCone, setShowCone] = useState<boolean>(true);
  const [showRadii, setShowRadii] = useState<boolean>(true);
  const [showSurge, setShowSurge] = useState<boolean>(true);
  const [showInfra, setShowInfra] = useState<boolean>(true);
  const [showEvac, setShowEvac] = useState<boolean>(true);

  if (!cyclone) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-950 text-slate-400 font-mono">
        Loading Authoritative Cyclone GIS Telemetry...
      </div>
    );
  }

  const currentPos = cyclone.current_position;
  const mapCenter: [number, number] = [currentPos.latitude, currentPos.longitude];

  // Past Track Polyline: list of [lat, lon]
  const pastTrackCoords = cyclone.historical_points.map(
    (pt) => [pt.latitude, pt.longitude] as [number, number]
  );
  if (pastTrackCoords.length > 0) {
    pastTrackCoords.push([currentPos.latitude, currentPos.longitude]);
  }

  // Forecast Track Polyline
  const forecastTrackCoords: [number, number][] = [
    [currentPos.latitude, currentPos.longitude],
    ...cyclone.forecast_points.map((pt) => [pt.latitude, pt.longitude] as [number, number]),
  ];

  // Forecast Cone GeoJSON Polygon: coordinates are [lon, lat] in GeoJSON format, Leaflet needs [lat, lon]
  const conePolygonCoords =
    cyclone.forecast_cone?.polygon_coordinates.map((coord) => [coord[1], coord[0]] as [number, number]) || [];

  return (
    <div className="relative w-full h-full min-h-[550px] rounded-xl overflow-hidden border border-slate-800 bg-[#0a0f1d] shadow-2xl">
      {/* Top Map Layer Control Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2 text-xs shadow-xl space-y-2 max-w-[260px]">
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> GIS Layer Controls
          </span>
          <span className="text-cyan-400">LEAFLET GIS</span>
        </div>

        {/* Base Layer Switcher */}
        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
          <button
            onClick={() => setActiveBaseLayer('carto')}
            className={`px-1.5 py-1 rounded text-center transition ${
              activeBaseLayer === 'carto'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Dark Carto
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-1.5 py-1 rounded text-center transition ${
              activeBaseLayer === 'satellite'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseLayer('opentopo')}
            className={`px-1.5 py-1 rounded text-center transition ${
              activeBaseLayer === 'opentopo'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Topography
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showCone}
              onChange={(e) => setShowCone(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Forecast Cone of Uncertainty</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRadii}
              onChange={(e) => setShowRadii(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Wind Radii (34kt / 50kt / 64kt)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showSurge}
              onChange={(e) => setShowSurge(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Modeled Storm Surge Extent</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showInfra}
              onChange={(e) => setShowInfra(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>OpenStreetMap Infrastructure ({infrastructure.length})</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showEvac}
              onChange={(e) => setShowEvac(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Evacuation Priority Sectors</span>
          </label>
        </div>
      </div>

      {/* Map Provenance Tag Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-1.5 pointer-events-none">
        <DataProvenanceBadge
          source={cyclone.source}
          dataType="OBSERVED"
          timestamp={new Date(currentPos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        />
        {showSurge && (
          <DataProvenanceBadge
            source="SLOSH Hydrodynamic Model"
            dataset="Inverted Barometer + Wind Setup"
            dataType="MODELED"
          />
        )}
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[550px]"
        style={{ background: '#0a0f1d' }}
      >
        <RecenterView center={mapCenter} />

        {/* Dynamic Base Tile Layer */}
        {activeBaseLayer === 'carto' && (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> dark tiles &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}
        {activeBaseLayer === 'satellite' && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> / Maxar / NASA GIBS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {activeBaseLayer === 'opentopo' && (
          <TileLayer
            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* 1. Forecast Cone of Uncertainty Polygon */}
        {showCone && conePolygonCoords.length > 3 && (
          <Polygon
            positions={conePolygonCoords}
            pathOptions={{
              color: '#06b6d4',
              weight: 1.5,
              dashArray: '4, 4',
              fillColor: '#0891b2',
              fillOpacity: 0.22,
            }}
          >
            <Popup>
              <div className="p-1 text-xs font-sans text-slate-800">
                <div className="font-bold text-cyan-800">Forecast Cone of Uncertainty</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Encompasses the official NHC/IMD probable track of the cyclone center with 67% statistical confidence.
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* 2. Observed Past Track Polyline (Solid Amber/Red) */}
        <Polyline
          positions={pastTrackCoords}
          pathOptions={{
            color: '#f97316',
            weight: 3.5,
            opacity: 0.9,
          }}
        />

        {/* 3. Forecast Track Polyline (Dashed Cyan) */}
        <Polyline
          positions={forecastTrackCoords}
          pathOptions={{
            color: '#00f0ff',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.9,
          }}
        />

        {/* 4. Past Track Points */}
        {cyclone.historical_points.map((pt, idx) => (
          <Marker
            key={`hist-${idx}`}
            position={[pt.latitude, pt.longitude]}
            icon={createCustomIcon('#f97316', '●')}
          >
            <Popup>
              <div className="p-1 text-xs font-sans text-slate-800">
                <div className="font-bold text-orange-800">{pt.category}</div>
                <div className="text-[11px] font-mono mt-1">
                  Wind: {pt.wind_speed_kmh} km/h ({pt.wind_speed_kts} kts)<br />
                  Pressure: {pt.pressure_hpa} hPa<br />
                  Timestamp: {new Date(pt.timestamp).toUTCString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. Forecast Track Points */}
        {cyclone.forecast_points.map((pt, idx) => (
          <Marker
            key={`fc-${idx}`}
            position={[pt.latitude, pt.longitude]}
            icon={createCustomIcon('#06b6d4', `+${(idx + 1) * 12}h`)}
          >
            <Popup>
              <div className="p-1 text-xs font-sans text-slate-800">
                <div className="font-bold text-cyan-800">
                  Forecast Lead +{(idx + 1) * 12} Hours
                </div>
                <div className="text-[11px] font-mono mt-1">
                  Wind: {pt.wind_speed_kmh} km/h<br />
                  Pressure: {pt.pressure_hpa} hPa<br />
                  Uncertainty Radius: ±{pt.uncertainty_radius_km} km
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 6. Current Cyclone Center with Eye Animation */}
        <Marker position={mapCenter} icon={stormCenterIcon}>
          <Popup>
            <div className="p-1 text-xs font-sans text-slate-800">
              <div className="font-extrabold text-red-700 text-sm">{cyclone.name}</div>
              <div className="text-xs font-semibold text-slate-700">{currentPos.category}</div>
              <div className="text-[11px] font-mono mt-1 space-y-0.5">
                <div><strong>Wind:</strong> {currentPos.wind_speed_kmh} km/h ({currentPos.wind_speed_kts} kts)</div>
                <div><strong>Pressure:</strong> {currentPos.pressure_hpa} hPa</div>
                <div><strong>Movement:</strong> {currentPos.movement_dir}° at {currentPos.movement_speed_kmh} km/h</div>
                <div><strong>Coordinates:</strong> {currentPos.latitude}°N, {currentPos.longitude}°E</div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* 7. Quadrant Wind Radii (34kt, 50kt, 64kt) around current position */}
        {showRadii && (
          <>
            {/* 34-knot Gale Radius (~120 km) */}
            <Circle
              center={mapCenter}
              radius={120000}
              pathOptions={{
                color: '#eab308',
                weight: 1,
                fillColor: '#facc15',
                fillOpacity: 0.08,
              }}
            />
            {/* 50-knot Storm Radius (~60 km) */}
            <Circle
              center={mapCenter}
              radius={60000}
              pathOptions={{
                color: '#f97316',
                weight: 1.2,
                fillColor: '#fb923c',
                fillOpacity: 0.12,
              }}
            />
            {/* 64-knot Hurricane Force Radius (~30 km) */}
            <Circle
              center={mapCenter}
              radius={30000}
              pathOptions={{
                color: '#ef4444',
                weight: 1.5,
                fillColor: '#f87171',
                fillOpacity: 0.18,
              }}
            />
          </>
        )}

        {/* 8. Evacuation Priority Sectors */}
        {showEvac &&
          riskData?.evacuation_zones.map((zone) => {
            const isSelected = selectedEvacuationZone?.zone_id === zone.zone_id;
            const zoneColor =
              zone.priority === 'CRITICAL'
                ? '#ef4444'
                : zone.priority === 'HIGH'
                ? '#f97316'
                : '#eab308';

            const polygonCoords = zone.polygon_coordinates.map(
              (c) => [c[1], c[0]] as [number, number]
            );

            return (
              <Polygon
                key={zone.zone_id}
                positions={polygonCoords}
                pathOptions={{
                  color: zoneColor,
                  weight: isSelected ? 3 : 1.5,
                  fillColor: zoneColor,
                  fillOpacity: isSelected ? 0.45 : 0.22,
                }}
                eventHandlers={{
                  click: () => onSelectEvacuationZone && onSelectEvacuationZone(zone),
                }}
              >
                <Popup>
                  <div className="p-1 text-xs font-sans text-slate-800">
                    <div className="font-bold text-red-700">{zone.name}</div>
                    <div className="text-[11px] font-mono mt-1">
                      <strong>Priority:</strong> {zone.priority}<br />
                      <strong>Population:</strong> {zone.population.toLocaleString()}<br />
                      <strong>Estimated Surge:</strong> {zone.surge_height_m} m<br />
                      <strong>24h Rainfall:</strong> {zone.rainfall_mm_24h} mm<br />
                      <strong>Nearest Shelter:</strong> {zone.nearest_shelter_km} km<br />
                      <strong>Road Risk:</strong> {zone.road_risk_level}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* 9. OpenStreetMap Infrastructure Markers */}
        {showInfra &&
          infrastructure.map((asset) => {
            let color = '#38bdf8';
            let label = 'I';
            if (asset.asset_type === 'hospital') {
              color = '#ef4444';
              label = 'H';
            } else if (asset.asset_type === 'shelter') {
              color = '#22c55e';
              label = 'S';
            } else if (asset.asset_type === 'bridge') {
              color = '#f59e0b';
              label = 'B';
            } else if (asset.asset_type === 'power_substation') {
              color = '#a855f7';
              label = 'P';
            }

            return (
              <Marker
                key={asset.id}
                position={[asset.latitude, asset.longitude]}
                icon={createCustomIcon(color, label)}
              >
                <Popup>
                  <div className="p-1 text-xs font-sans text-slate-800 max-w-[220px]">
                    <div className="font-bold text-slate-900">{asset.name}</div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Type: {asset.asset_type.toUpperCase()}<br />
                      Elevation: {asset.elevation_m} m<br />
                      Distance to Coast: {asset.distance_to_coast_km} km<br />
                      Capacity: {asset.capacity || 'N/A'}<br />
                      Risk Score: {asset.risk_score}/100
                    </div>
                    {asset.hazards && asset.hazards.length > 0 && (
                      <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-red-600 font-semibold">
                        Hazards: {asset.hazards.join(', ')}
                      </div>
                    )}
                    <div className="text-[9px] text-slate-500 font-mono mt-1">
                      {asset.source}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2 text-[10px] font-mono text-slate-300 flex flex-wrap items-center gap-3 shadow-xl">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
          <span>Eye of Cyclone</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-0.5 bg-orange-500"></span>
          <span>Observed Track</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
          <span>Forecast Track</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-cyan-500/40 border border-cyan-400"></span>
          <span>Forecast Cone</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span>Hospital</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Shelter</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Power Grid</span>
        </div>
      </div>
    </div>
  );
};
