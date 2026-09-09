import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  Polygon
} from "react-leaflet";
import L from "leaflet";
import {
  Layers,
  AlertTriangle,
  Radio,
  Navigation,
  Shield,
  Activity,
  Droplets,
  Mountain,
  Waves,
  History,
  Route,
  Home,
  CheckSquare,
  Square,
  Sparkles
} from "lucide-react";
import RiskGauge from "./RiskGauge";

// Colored Leaflet pin icons
const createPinIcon = (color, emoji) => {
  const html = `
    <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px;">
      ${emoji}
    </div>
  `;
  return L.divIcon({
    className: "custom-map-pin",
    html: html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const ICONS = {
  critical: createPinIcon("#dc2626", "🔴"),
  high: createPinIcon("#ea580c", "🟠"),
  moderate: createPinIcon("#d97706", "🟡"),
  low: createPinIcon("#16a34a", "🟢"),
  flood: createPinIcon("#0284c7", "🌊"),
  landslide: createPinIcon("#b45309", "⛰️"),
  shelter: createPinIcon("#059669", "🏥"),
  village: createPinIcon("#6366f1", "🏘️"),
};

export default function GISRiskMap({
  locations = [],
  selectedLocation = null,
  onSelectLocation = null,
  facilities = []
}) {
  const [filterState, setFilterState] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [baseMap, setBaseMap] = useState("streets"); // 'streets' or 'satellite'

  // Layer Visibility Checkboxes
  const [layers, setLayers] = useState({
    floodRisk: true,
    landslideRisk: true,
    historicalFlood: true,
    historicalLandslide: true,
    roads: true,
    villages: true,
    rivers: true,
    rainfall: true,
    soilMoisture: true,
  });

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const states = [
    "All",
    "West Bengal",
    "Sikkim",
    "Assam",
    "Meghalaya",
    "Arunachal Pradesh",
    "Nagaland",
    "Manipur",
    "Mizoram",
    "Tripura"
  ];

  // Filtered locations
  const filteredLocs = locations.filter((l) => {
    const matchState = filterState === "All" || l.state === filterState;
    const matchRisk = filterRisk === "All" || l.risk_level === filterRisk;
    return matchState && matchRisk;
  });

  // Notable highway corridors for polyline rendering
  const HIGHWAY_CORRIDORS = [
    {
      name: "NH-10 (Siliguri - Sevoke - Teesta Bazar - Gangtok)",
      coords: [
        [26.7271, 88.3953],
        [26.8833, 88.4500],
        [26.9800, 88.4800],
        [27.0667, 88.4667],
        [27.1700, 88.5100],
        [27.2340, 88.4980],
        [27.3389, 88.6065]
      ],
      color: "#dc2626", // High risk
      status: "High Landslide Vulnerability (29th Mile & Birik Dara)"
    },
    {
      name: "NH-55 (Siliguri - Kurseong - Darjeeling)",
      coords: [
        [26.7271, 88.3953],
        [26.8833, 88.2833],
        [27.0360, 88.2627]
      ],
      color: "#ea580c",
      status: "Moderate Slip Watch (Giddapahar & Rohini Bypass)"
    },
    {
      name: "NH-6 (Guwahati - Shillong - Aizawl)",
      coords: [
        [26.1445, 91.7362],
        [25.9000, 91.8000],
        [25.5788, 91.8933],
        [24.8333, 92.7789],
        [23.7271, 92.7176]
      ],
      color: "#d97706",
      status: "Corridor Active"
    },
    {
      name: "NH-29 (Dimapur - Kohima)",
      coords: [
        [25.9090, 93.7270],
        [25.8000, 93.9000],
        [25.6751, 94.1086]
      ],
      color: "#dc2626",
      status: "Critical Sinking Area (Dzüdza & Phevima)"
    }
  ];

  // River vectors
  const RIVERS = [
    {
      name: "Brahmaputra River Basin",
      coords: [
        [28.0667, 95.3333],
        [27.4728, 94.9120],
        [26.9500, 94.2167],
        [26.5775, 93.1711],
        [26.1445, 91.7362],
        [26.0200, 89.9800]
      ],
      color: "#0284c7"
    },
    {
      name: "Teesta River System",
      coords: [
        [27.4975, 88.5340],
        [27.3389, 88.6065],
        [27.2340, 88.4980],
        [26.9800, 88.4800],
        [26.7271, 88.3953]
      ],
      color: "#0284c7"
    }
  ];

  // Villages / Settlements
  const VILLAGES = [
    { name: "Lebong Busty", lat: 27.0500, lon: 88.2700, state: "West Bengal", pop: 3400 },
    { name: "Teesta Bazar Village", lat: 27.0700, lon: 88.4300, state: "West Bengal", pop: 2100 },
    { name: "Singtam Ward 4", lat: 27.2340, lon: 88.5100, state: "Sikkim", pop: 4800 },
    { name: "Kamakhya Foothills", lat: 26.1600, lon: 91.7100, state: "Assam", pop: 7200 },
    { name: "Dima Hasao Lower Ward", lat: 25.1700, lon: 93.0200, state: "Assam", pop: 1900 },
    { name: "Upper Shillong Colony", lat: 25.5600, lon: 91.8800, state: "Meghalaya", pop: 5400 }
  ];

  const centerCoordinates = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : [26.7000, 91.5000]; // Regional center

  return (
    <div className="space-y-4">
      {/* Top Filter & Layer Bar - Clean White Theme */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Interactive Multi-Hazard GIS & Highway Grid Map
              </h2>
              <p className="text-xs text-slate-500">
                Live spatial susceptibility, vulnerable highway passes, active floodplains & safe emergency shelters.
              </p>
            </div>
          </div>

          {/* Map Base & Region Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">State:</span>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Risk:</span>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Tiers</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MODERATE">🟡 Moderate</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </div>

            {/* Satellite / Street Map Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setBaseMap("streets")}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  baseMap === "streets" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Streets
              </button>
              <button
                type="button"
                onClick={() => setBaseMap("satellite")}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  baseMap === "satellite" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Satellite Imagery
              </button>
            </div>
          </div>
        </div>

        {/* 10 Layer Toggle Checkboxes as requested by user */}
        <div className="mt-3 pt-1 flex items-center gap-3 flex-wrap text-xs text-slate-700 font-medium">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Map Layers:</span>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.floodRisk}
              onChange={() => toggleLayer("floodRisk")}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Flood Risk</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.landslideRisk}
              onChange={() => toggleLayer("landslideRisk")}
              className="rounded text-amber-600 focus:ring-0"
            />
            <span>Landslide Risk</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.historicalFlood}
              onChange={() => toggleLayer("historicalFlood")}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>Historical Flood</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.historicalLandslide}
              onChange={() => toggleLayer("historicalLandslide")}
              className="rounded text-red-600 focus:ring-0"
            />
            <span>Historical Landslide</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.roads}
              onChange={() => toggleLayer("roads")}
              className="rounded text-orange-600 focus:ring-0"
            />
            <span>Roads & Highways</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.villages}
              onChange={() => toggleLayer("villages")}
              className="rounded text-purple-600 focus:ring-0"
            />
            <span>Villages / Settlements</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.rivers}
              onChange={() => toggleLayer("rivers")}
              className="rounded text-cyan-600 focus:ring-0"
            />
            <span>Rivers / Drainage</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.rainfall}
              onChange={() => toggleLayer("rainfall")}
              className="rounded text-blue-500 focus:ring-0"
            />
            <span>Rainfall Radar</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-emerald-700">
            <input
              type="checkbox"
              checked={layers.soilMoisture}
              onChange={() => toggleLayer("soilMoisture")}
              className="rounded text-teal-600 focus:ring-0"
            />
            <span>Soil Moisture</span>
          </label>
        </div>
      </div>

      {/* Main Map Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[640px]">
        {/* Left Side: Station & Spot Inspector Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between overflow-y-auto shadow-xs">
          {selectedLocation ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                    {selectedLocation.code || "STATION"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                      selectedLocation.risk_score >= 60
                        ? "bg-red-100 text-red-800 border border-red-300 ring-1 ring-red-400"
                        : selectedLocation.risk_score < 40
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-black"
                        : "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                    }`}
                  >
                    {selectedLocation.risk_score >= 60
                      ? "🔴 DANGER ZONE"
                      : selectedLocation.risk_score < 40
                      ? "🟢 DANGER FREE (SAFE)"
                      : "🟡 MODERATE (WATCH)"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedLocation.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedLocation.district}, {selectedLocation.state}
                </p>
                {selectedLocation.highway && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {selectedLocation.highway}
                  </span>
                )}
              </div>

              {/* Status Callout Banner */}
              {selectedLocation.risk_score >= 60 ? (
                <div className="p-2.5 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>🔴 DANGER: CRITICAL RISK DETECTED</span>
                </div>
              ) : selectedLocation.risk_score < 40 ? (
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>🟢 DANGER FREE: SAFE & STABLE TERRAIN</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>🟡 WATCH PHASE: MODERATE HAZARD</span>
                </div>
              )}

              {/* Dynamic Score and Probability */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Hazard Score:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedLocation.risk_score} / 100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Failure Probability:</span>
                  <span className="font-bold text-amber-800 font-mono text-sm">
                    {selectedLocation.landslide_probability || 45}%
                  </span>
                </div>
              </div>

              {/* Geotechnical Terrain Profile */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700">Geotechnical Attributes:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Slope Gradient:</span>
                    <span className="font-bold text-slate-900">
                      {selectedLocation.slope_angle_deg || selectedLocation.slope || 34}°
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Elevation:</span>
                    <span className="font-bold text-slate-900">
                      {selectedLocation.elevation_m || selectedLocation.elevation || 1200}m
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Lithology:</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedLocation.lithology || "Weathered Shale"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">River Basin:</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedLocation.river || "Teesta / Barak"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Directives */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Disaster Protocol:</span>
                </div>
                <span>
                  {selectedLocation.risk_score >= 60
                    ? "Activate perimeter road barriers and warn downhill settlements."
                    : "Standard IoT telemetry monitoring active."}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Mountain className="w-8 h-8 text-slate-300 mb-2" />
              <h4 className="text-xs font-bold text-slate-700">Select Any GIS Station / Pin</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Click any marker, road segment, or village on the GIS map to inspect live risk telemetry and geotechnical parameters.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Grid: GSI / IMD Telemetry</span>
            <span>Refreshed Live</span>
          </div>
        </div>

        {/* Right Side: Leaflet Map Container */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
          <MapContainer
            center={centerCoordinates}
            zoom={8}
            className="w-full h-full"
            style={{ height: "100%", width: "100%" }}
          >
            {/* Tile Layer: Streets vs Satellite */}
            {baseMap === "satellite" ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri World Imagery"
              />
            ) : (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            )}

            {/* 1. Monitored Station Markers (Landslide Risk) */}
            {layers.landslideRisk &&
              filteredLocs.map((loc) => {
                const icon =
                  loc.risk_score >= 80 ? ICONS.critical :
                  loc.risk_score >= 60 ? ICONS.high :
                  loc.risk_score >= 40 ? ICONS.moderate : ICONS.low;

                return (
                  <Marker
                    key={loc.id || loc.name}
                    position={[loc.latitude, loc.longitude]}
                    icon={icon}
                    eventHandlers={{
                      click: () => onSelectLocation && onSelectLocation(loc),
                    }}
                  >
                    <Popup>
                      <div className="text-xs font-sans space-y-1.5 p-0.5">
                        <strong className="text-slate-900 block text-sm">{loc.name}</strong>
                        <span className="text-slate-500 block text-[11px]">{loc.district}, {loc.state}</span>
                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            loc.risk_score >= 60 ? "bg-red-100 text-red-800 border border-red-300" :
                            loc.risk_score < 40 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                            "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}>
                            {loc.risk_score >= 60 ? "🔴 DANGER ZONE" : loc.risk_score < 40 ? "🟢 DANGER FREE" : "🟡 MODERATE"}
                          </span>
                          <strong className="text-slate-900 font-mono">{loc.risk_score}/100</strong>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* 2. Vulnerable Roads & Highways */}
            {layers.roads &&
              HIGHWAY_CORRIDORS.map((hwy, idx) => (
                <Polyline
                  key={idx}
                  positions={hwy.coords}
                  pathOptions={{
                    color: hwy.color,
                    weight: 5,
                    opacity: 0.85,
                    dashArray: hwy.color === "#dc2626" ? "6, 6" : undefined,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-sans space-y-1">
                      <strong className="text-slate-900 block">{hwy.name}</strong>
                      <span className="text-red-700 font-bold block">{hwy.status}</span>
                      <span className="text-[10px] text-slate-500">Monitored corridor</span>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* 3. River Drainage Network */}
            {layers.rivers &&
              RIVERS.map((riv, idx) => (
                <Polyline
                  key={idx}
                  positions={riv.coords}
                  pathOptions={{
                    color: riv.color,
                    weight: 4,
                    opacity: 0.7,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong className="text-blue-900">{riv.name}</strong>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* 4. Villages & Settlements */}
            {layers.villages &&
              VILLAGES.map((v, idx) => (
                <Marker key={idx} position={[v.lat, v.lon]} icon={ICONS.village}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong className="text-indigo-900 block">🏘️ {v.name}</strong>
                      <span className="text-slate-500 block">Population: {v.pop.toLocaleString()}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* 5. Rainfall Radar Simulation Buffers */}
            {layers.rainfall && (
              <>
                <Circle
                  center={[27.0360, 88.2627]}
                  radius={18000}
                  pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15 }}
                />
                <Circle
                  center={[26.9800, 88.4800]}
                  radius={22000}
                  pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2 }}
                />
                <Circle
                  center={[25.3000, 91.7000]}
                  radius={25000}
                  pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.2 }}
                />
              </>
            )}

            {/* 6. Flood Inundation Zones */}
            {layers.floodRisk && (
              <>
                <Polygon
                  positions={[
                    [24.8100, 92.7600],
                    [24.8400, 92.8100],
                    [24.8600, 92.7700],
                    [24.8200, 92.7400]
                  ]}
                  pathOptions={{ color: "#0284c7", fillColor: "#0284c7", fillOpacity: 0.3 }}
                />
                <Polygon
                  positions={[
                    [26.9300, 94.1800],
                    [26.9700, 94.2500],
                    [26.9800, 94.2000],
                    [26.9400, 94.1500]
                  ]}
                  pathOptions={{ color: "#0284c7", fillColor: "#0284c7", fillOpacity: 0.35 }}
                />
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
