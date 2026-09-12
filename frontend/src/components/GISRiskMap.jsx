import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  Polygon,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import {
  Layers, AlertTriangle, Globe2, Mountain, Waves, Activity,
  CloudRain, Thermometer, MapPin, Shield, Eye, EyeOff,
  Crosshair, Navigation, Filter, X, ChevronRight, Sparkles,
  Radio, Zap, Map as MapIcon, ArrowRight, Info
} from "lucide-react";
import { inspectCoordinate, getFloodZones } from "../api";

// ─── Leaflet icon helpers ───────────────────────────────────────────────────
const pin = (color, emoji) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:13px;">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });

const ICONS = {
  critical:  pin("#dc2626", "🔴"),
  high:      pin("#ea580c", "🟠"),
  moderate:  pin("#d97706", "🟡"),
  low:       pin("#16a34a", "🟢"),
  flood:     pin("#0284c7", "🌊"),
  landslide: pin("#b45309", "⛰️"),
  shelter:   pin("#059669", "🏥"),
  village:   pin("#6366f1", "🏘️"),
  seismic:   pin("#7c3aed", "🔵"),
  inspect:   pin("#0f172a", "📍"),
};

const scoreIcon = (score) => {
  if (score >= 80) return ICONS.critical;
  if (score >= 60) return ICONS.high;
  if (score >= 40) return ICONS.moderate;
  return ICONS.low;
};

// ─── Static geo data ────────────────────────────────────────────────────────
const HIGHWAYS = [
  { name: "NH-10 · Siliguri → Gangtok (High Landslide Risk)", color: "#dc2626", risk: "HIGH",
    coords: [[26.727,88.395],[26.883,88.450],[26.980,88.480],[27.067,88.467],[27.170,88.510],[27.234,88.498],[27.339,88.607]] },
  { name: "NH-55 · Siliguri → Darjeeling", color: "#ea580c", risk: "MODERATE",
    coords: [[26.727,88.395],[26.883,88.283],[27.036,88.263]] },
  { name: "NH-6 · Guwahati → Shillong → Aizawl", color: "#d97706", risk: "MODERATE",
    coords: [[26.144,91.736],[25.900,91.800],[25.579,91.893],[24.833,92.779],[23.727,92.718]] },
  { name: "NH-29 · Dimapur → Kohima (Critical Sinking Zone)", color: "#dc2626", risk: "HIGH",
    coords: [[25.909,93.727],[25.800,93.900],[25.675,94.109]] },
  { name: "NH-13 · Trans-Arunachal Highway", color: "#b45309", risk: "MODERATE",
    coords: [[26.944,93.616],[27.100,93.900],[27.250,94.200],[27.500,94.600]] },
  { name: "NH-27 · Dima Hasao Corridor (Assam)", color: "#ea580c", risk: "HIGH",
    coords: [[25.170,92.770],[25.300,93.000],[25.420,93.200]] },
  { name: "NH-107 · Rishikesh → Kedarnath", color: "#dc2626", risk: "CRITICAL",
    coords: [[30.085,78.268],[30.250,78.800],[30.500,79.100],[30.734,79.067]] },
  { name: "NH-58 · Joshimath Corridor (Uttarakhand)", color: "#dc2626", risk: "CRITICAL",
    coords: [[30.085,78.268],[30.300,79.200],[30.556,79.565]] },
];

const RIVERS = [
  { name: "Brahmaputra", color: "#1d4ed8",
    coords: [[28.067,95.333],[27.473,94.912],[26.950,94.217],[26.578,93.171],[26.144,91.736],[26.020,89.980]] },
  { name: "Teesta", color: "#2563eb",
    coords: [[27.498,88.534],[27.339,88.607],[27.234,88.498],[26.980,88.480],[26.727,88.395]] },
  { name: "Barak / Surma", color: "#3b82f6",
    coords: [[25.150,93.800],[24.833,92.779],[24.500,91.900],[24.200,91.600]] },
  { name: "Subansiri", color: "#60a5fa",
    coords: [[27.800,94.500],[27.300,93.500],[26.600,93.200],[26.144,91.736]] },
  { name: "Ganga (Upper)", color: "#1d4ed8",
    coords: [[30.900,78.800],[30.300,78.500],[29.950,78.200],[29.500,77.800],[28.600,77.200]] },
];

// NER state approximate boundary boxes for shading
const NER_POLYGONS = [
  { name: "Assam",            color: "#3b82f6", coords: [[27.5,89.7],[27.5,96.0],[24.1,96.0],[24.1,89.7]] },
  { name: "Meghalaya",        color: "#8b5cf6", coords: [[26.1,89.8],[26.1,92.8],[24.9,92.8],[24.9,89.8]] },
  { name: "Sikkim",           color: "#ec4899", coords: [[28.2,88.0],[28.2,88.9],[27.1,88.9],[27.1,88.0]] },
  { name: "Arunachal Pradesh",color: "#f59e0b", coords: [[29.5,91.5],[29.5,97.4],[26.6,97.4],[26.6,91.5]] },
  { name: "Manipur",          color: "#10b981", coords: [[25.7,92.9],[25.7,94.8],[23.8,94.8],[23.8,92.9]] },
  { name: "Mizoram",          color: "#06b6d4", coords: [[24.5,92.2],[24.5,93.4],[21.9,93.4],[21.9,92.2]] },
  { name: "Nagaland",         color: "#84cc16", coords: [[27.1,93.3],[27.1,95.3],[25.2,95.3],[25.2,93.3]] },
  { name: "Tripura",          color: "#f97316", coords: [[24.5,91.2],[24.5,92.4],[22.9,92.4],[22.9,91.2]] },
];

// Map view configurations
const MAP_VIEWS = {
  ner: { center: [26.0, 92.5], zoom: 7, label: "🏔️ NER Focus" },
  pan_india: { center: [22.5, 80.0], zoom: 5, label: "🇮🇳 Pan-India" },
  northeast_himalayas: { center: [27.5, 88.5], zoom: 8, label: "⛰️ NE Himalayas" },
  western_ghats: { center: [10.8, 76.5], zoom: 7, label: "🌿 Western Ghats" },
  uttarakhand: { center: [30.4, 79.0], zoom: 8, label: "🏔️ Uttarakhand" },
};

// Hazard filter definitions
const HAZARD_FILTERS = [
  { key: "all",        label: "All Hazards",      icon: "🛡️", color: "slate" },
  { key: "landslide",  label: "Landslide",        icon: "⛰️", color: "amber" },
  { key: "flood",      label: "Flood",            icon: "🌊", color: "blue" },
  { key: "earthquake", label: "Earthquake",       icon: "🔵", color: "purple" },
  { key: "rainfall",   label: "Extreme Rainfall", icon: "🌧️", color: "sky" },
  { key: "cyclone",    label: "Cyclone",          icon: "🌀", color: "cyan" },
  { key: "heatwave",   label: "Heatwave",         icon: "☀️", color: "orange" },
];

// Risk colour map
const RC = (score) => {
  if (score >= 80) return { fill: "#fecaca", stroke: "#dc2626", label: "CRITICAL" };
  if (score >= 60) return { fill: "#fed7aa", stroke: "#ea580c", label: "HIGH"     };
  if (score >= 40) return { fill: "#fef08a", stroke: "#ca8a04", label: "MODERATE" };
  return              { fill: "#bbf7d0", stroke: "#16a34a", label: "LOW"      };
};

// ─── Map click inspector ────────────────────────────────────────────────────
function ClickInspector({ active, onInspect }) {
  useMapEvents({
    click: (e) => {
      if (active) onInspect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GISRiskMap({ locations = [], selectedLocation = null, onSelectLocation = null, facilities = [] }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [viewKey, setViewKey]         = useState("ner");
  const [baseMap, setBaseMap]         = useState("streets");
  const [hazardFilter, setHazardFilter] = useState("all");
  const [filterState, setFilterState] = useState("All");
  const [filterRisk, setFilterRisk]   = useState("All");
  const [inspectMode, setInspectMode] = useState(false);
  const [inspecting, setInspecting]   = useState(false);
  const [inspectResult, setInspectResult] = useState(null);
  const [inspectLatLng, setInspectLatLng] = useState(null);
  const [floodZones, setFloodZones]   = useState([]);
  const [sidePanel, setSidePanel]     = useState(true);

  const [layers, setLayers] = useState({
    stations:         true,
    floodZones:       true,
    highways:         true,
    rivers:           true,
    villages:         false,
    facilities:       true,
    nerBoundaries:    true,
    rainfallCircles:  false,
    historicalEvents: false,
    seismicZones:     false,
  });

  const toggleLayer = (k) => setLayers((p) => ({ ...p, [k]: !p[k] }));

  // Load flood zones once
  useEffect(() => {
    getFloodZones()
      .then((g) => setFloodZones(g?.features || []))
      .catch(() => {});
  }, []);

  // When selectedLocation changes, fly map to it
  useEffect(() => {
    const m = mapRef.current;
    if (m && selectedLocation?.latitude && selectedLocation?.longitude) {
      m.flyTo([selectedLocation.latitude, selectedLocation.longitude], 11, { duration: 1.2 });
    }
  }, [selectedLocation]);

  const handleInspect = useCallback(async (lat, lng) => {
    setInspecting(true);
    setInspectLatLng({ lat, lng });
    try {
      const data = await inspectCoordinate(lat, lng);
      setInspectResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setInspecting(false);
    }
  }, []);

  // Filter locations
  const filteredLocs = locations.filter((l) => {
    const stateOk = filterState === "All" || l.state === filterState;
    const riskOk  = filterRisk  === "All" || l.risk_level === filterRisk;
    const hazardOk = hazardFilter === "all" || true; // All stations shown for all hazards
    return stateOk && riskOk && hazardOk;
  });

  const view = MAP_VIEWS[viewKey] ?? MAP_VIEWS.ner;
  const tileUrl = baseMap === "satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const tileAttr = baseMap === "satellite"
    ? "Tiles © Esri — Esri, DeLorme, NAVTEQ, USGS, NRCS"
    : '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>';

  const NER_STATES_LIST = ["All","Assam","Arunachal Pradesh","Meghalaya","Manipur","Mizoram","Nagaland","Tripura","Sikkim","West Bengal"];

  return (
    <div className="space-y-3">
      {/* ── Controls Panel ──────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">

        {/* Row 1: Title + mode switcher + basemap */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <Layers className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Interactive Multi-Hazard GIS Risk Map</h2>
              <p className="text-xs text-slate-500">Live spatial susceptibility, highways, rivers, seismic zones & emergency shelters.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View presets */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px]">
              {Object.entries(MAP_VIEWS).map(([k, v]) => (
                <button key={k} onClick={() => setViewKey(k)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${viewKey === k ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Basemap toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {["streets","satellite"].map((b) => (
                <button key={b} onClick={() => setBaseMap(b)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${baseMap === b ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>
                  {b === "streets" ? "Streets" : "Satellite"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Hazard filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Hazard Filter:</span>
          {HAZARD_FILTERS.map((h) => (
            <button key={h.key} onClick={() => setHazardFilter(h.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                hazardFilter === h.key
                  ? "bg-slate-900 text-white border-slate-900 shadow"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400"
              }`}>
              <span>{h.icon}</span><span>{h.label}</span>
            </button>
          ))}
        </div>

        {/* Row 3: Dropdowns + layer toggles + inspect */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {NER_STATES_LIST.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="All">All Risk Tiers</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MODERATE">🟡 Moderate</option>
              <option value="LOW">🟢 Low</option>
            </select>

            {/* Inspect mode toggle */}
            <button onClick={() => { setInspectMode((p) => !p); setInspectResult(null); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                inspectMode ? "bg-purple-700 text-white border-purple-700 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-300 hover:border-purple-500"
              }`}>
              <Crosshair className="w-3.5 h-3.5" />
              {inspectMode ? "Click map to inspect..." : "Click-to-Inspect"}
            </button>
          </div>

          {/* Layer checkboxes */}
          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-slate-700 font-medium">
            {[
              { k: "stations",         label: "Stations"          },
              { k: "floodZones",       label: "Flood Zones"       },
              { k: "nerBoundaries",    label: "NER Borders"       },
              { k: "highways",         label: "Highways"          },
              { k: "rivers",           label: "Rivers"            },
              { k: "facilities",       label: "Shelters"          },
              { k: "rainfallCircles",  label: "Rainfall Radar"    },
              { k: "historicalEvents", label: "History"           },
              { k: "seismicZones",     label: "Seismic"           },
              { k: "villages",         label: "Settlements"       },
            ].map(({ k, label }) => (
              <label key={k} className="flex items-center gap-1 cursor-pointer select-none hover:text-emerald-700">
                <input type="checkbox" checked={layers[k]} onChange={() => toggleLayer(k)}
                  className="rounded text-emerald-600 focus:ring-0 w-3 h-3" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map + Side Panel Row ─────────────────────────────────── */}
      <div className="flex gap-3">
        {/* Map */}
        <div className={`relative flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm ${inspectMode ? "cursor-crosshair" : ""}`}
          style={{ height: "600px" }}>
          <MapContainer
            key={viewKey}
            center={view.center}
            zoom={view.zoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            whenCreated={(m) => { mapRef.current = m; }}
          >
            <ZoomControl position="topright" />
            <ClickInspector active={inspectMode} onInspect={handleInspect} />

            {/* Basemap tile */}
            <TileLayer url={tileUrl} attribution={tileAttr} maxZoom={19} />

            {/* ── NER State Boundary Shading ── */}
            {layers.nerBoundaries && NER_POLYGONS.map((p) => (
              <Polygon key={p.name} positions={p.coords}
                pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.06, weight: 1.5, dashArray: "5,5" }}>
                <Popup>
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-slate-500">NER State Boundary</div>
                </Popup>
              </Polygon>
            ))}

            {/* ── Flood Zone Polygons ── */}
            {layers.floodZones && floodZones.map((f, i) => {
              const coords = f.geometry?.coordinates?.[0]?.map(([lng, lat]) => [lat, lng]) || [];
              if (!coords.length) return null;
              return (
                <Polygon key={i} positions={coords}
                  pathOptions={{ color: "#0284c7", fillColor: "#bae6fd", fillOpacity: 0.35, weight: 1.5 }}>
                  <Popup>
                    <div className="text-xs font-bold text-blue-800">{f.properties?.name ?? "Flood Zone"}</div>
                    <div className="text-[10px] text-slate-600">{f.properties?.state ?? ""}</div>
                    <div className="text-[10px] text-blue-700 font-semibold">Flood Risk: {f.properties?.risk_level ?? "High"}</div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* ── Seismic Zone V shading (NER) ── */}
            {layers.seismicZones && (
              <Polygon
                positions={[[24.0,88.0],[29.5,88.0],[29.5,98.0],[24.0,98.0]]}
                pathOptions={{ color: "#7c3aed", fillColor: "#ddd6fe", fillOpacity: 0.08, weight: 1, dashArray: "8,4" }}>
                <Popup><div className="text-xs font-bold text-purple-800">BIS Seismic Zone V — North East India</div><div className="text-[10px]">High seismic hazard region (BIS IS 1893:2016)</div></Popup>
              </Polygon>
            )}

            {/* ── Highways ── */}
            {layers.highways && HIGHWAYS.map((h) => (
              <Polyline key={h.name} positions={h.coords}
                pathOptions={{ color: h.color, weight: 3, opacity: 0.85, dashArray: h.risk === "CRITICAL" ? "8,4" : undefined }}>
                <Popup>
                  <div className="text-xs font-bold">{h.name}</div>
                  <div className={`text-[10px] font-bold mt-0.5 ${h.risk === "CRITICAL" ? "text-red-700" : h.risk === "HIGH" ? "text-orange-700" : "text-amber-700"}`}>
                    Risk: {h.risk}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Landslide-vulnerable corridor</div>
                </Popup>
              </Polyline>
            ))}

            {/* ── Rivers ── */}
            {layers.rivers && RIVERS.map((r) => (
              <Polyline key={r.name} positions={r.coords}
                pathOptions={{ color: r.color, weight: 2.5, opacity: 0.75 }}>
                <Popup><div className="text-xs font-bold text-blue-800">{r.name}</div><div className="text-[10px] text-slate-500">River System</div></Popup>
              </Polyline>
            ))}

            {/* ── Rainfall Radar Circles ── */}
            {layers.rainfallCircles && locations.filter((l) => l.rainfall_24h > 60).map((l) => (
              <Circle key={`rain-${l.id}`}
                center={[l.latitude, l.longitude]}
                radius={l.rainfall_24h ? Math.min(l.rainfall_24h * 250, 40000) : 8000}
                pathOptions={{ color: "#0369a1", fillColor: "#bae6fd", fillOpacity: 0.3, weight: 1 }} />
            ))}

            {/* ── Monitoring Stations ── */}
            {layers.stations && filteredLocs.map((l) => (
              <Marker key={l.id} position={[l.latitude, l.longitude]} icon={scoreIcon(l.risk_score ?? 50)}
                eventHandlers={{ click: () => onSelectLocation?.(l) }}>
                <Popup maxWidth={260}>
                  <div className="text-xs space-y-1.5 p-1">
                    <div className="font-black text-slate-900 text-sm">{l.name}</div>
                    <div className="text-slate-500">{l.state} {l.district ? `· ${l.district}` : ""}</div>
                    {l.highway && <div className="text-blue-700 font-semibold">{l.highway}</div>}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-600">Risk Score:</span>
                      <span className={`font-black text-lg ${l.risk_score >= 80 ? "text-red-700" : l.risk_score >= 60 ? "text-orange-700" : "text-amber-700"}`}>
                        {l.risk_score}/100
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Elev: {l.elevation_m}m · Slope: {l.slope_deg}°
                    </div>
                    <button
                      onClick={() => navigate(`/app/analyze?q=${encodeURIComponent(l.name)}`)}
                      className="w-full mt-1 py-1.5 bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" /> Full AI Analysis
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* ── Emergency Facilities ── */}
            {layers.facilities && facilities.map((f) => f.latitude && f.longitude && (
              <Marker key={f.id} position={[f.latitude, f.longitude]} icon={ICONS.shelter}>
                <Popup>
                  <div className="text-xs font-bold">{f.name}</div>
                  <div className="text-[10px] text-slate-500">{f.facility_type} · Cap: {f.capacity}</div>
                  {f.contact && <div className="text-[10px] text-emerald-700">📞 {f.contact}</div>}
                </Popup>
              </Marker>
            ))}

            {/* ── Inspect marker ── */}
            {inspectLatLng && (
              <Marker position={[inspectLatLng.lat, inspectLatLng.lng]} icon={ICONS.inspect}>
                <Popup>
                  <div className="text-xs font-bold">Inspecting…</div>
                  <div className="text-[10px] text-slate-500">{inspectLatLng.lat.toFixed(4)}°N, {inspectLatLng.lng.toFixed(4)}°E</div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Inspect loading overlay */}
          {inspecting && (
            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center rounded-xl z-[500]">
              <div className="bg-white rounded-xl p-4 shadow-xl text-xs font-bold text-slate-800 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                Running AI inference for selected coordinates…
              </div>
            </div>
          )}

          {/* Map legend */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm rounded-xl p-2.5 border border-slate-200 shadow-md text-[10px] font-bold space-y-1">
            <div className="text-slate-500 uppercase tracking-wider mb-1">Risk Legend</div>
            {[
              { color: "#dc2626", label: "Critical ≥80" },
              { color: "#ea580c", label: "High ≥60" },
              { color: "#ca8a04", label: "Moderate ≥40" },
              { color: "#16a34a", label: "Low <40" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-slate-700">{l.label}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-1 mt-1 space-y-1">
              <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-red-600" /><span>Highway (High Risk)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-blue-600" /><span>River</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-400" /><span>Flood Zone</span></div>
            </div>
          </div>

          {/* Pan-India quick jump buttons */}
          <div className="absolute top-3 left-3 z-[400] space-y-1">
            {[
              { key: "ner",                 label: "NER",        emoji: "🏔️" },
              { key: "pan_india",           label: "India",      emoji: "🇮🇳" },
              { key: "northeast_himalayas", label: "NE Himal",   emoji: "⛰️" },
              { key: "uttarakhand",         label: "UK/HP",      emoji: "🌨️" },
              { key: "western_ghats",       label: "W.Ghats",    emoji: "🌿" },
            ].map((b) => (
              <button key={b.key} onClick={() => setViewKey(b.key)}
                className={`block text-left px-2 py-1 rounded-lg text-[10px] font-bold border shadow transition ${
                  viewKey === b.key ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                }`}>
                {b.emoji} {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Side Panel ── */}
        {sidePanel && (
          <div className="w-72 shrink-0 flex flex-col gap-3 max-h-[600px] overflow-y-auto">
            {/* Inspect result */}
            {inspectResult ? (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-black text-slate-900">
                    <Crosshair className="w-3.5 h-3.5 text-purple-600" />
                    Inspect Result
                  </div>
                  <button onClick={() => setInspectResult(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="font-black text-slate-900 text-sm">{inspectResult.location?.name ?? "Unknown"}</div>
                <div className="text-slate-500">{inspectResult.location?.state ?? ""}</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Overall Risk", val: `${inspectResult.multi_hazard_scorecard?.overall_risk_score ?? "--"}/100` },
                    { label: "Landslide", val: `${inspectResult.multi_hazard_scorecard?.landslide_score ?? "--"}/100` },
                    { label: "Flood", val: `${inspectResult.multi_hazard_scorecard?.flood_score ?? "--"}/100` },
                    { label: "24h Rain", val: `${inspectResult.live_meteorology?.rainfall_24h_mm ?? "--"} mm` },
                  ].map((m) => (
                    <div key={m.label} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-bold block">{m.label}</span>
                      <span className="font-black text-slate-900">{m.val}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate(`/app/analyze?q=${encodeURIComponent(inspectResult.location?.name ?? "")}`)}
                  className="w-full py-2 bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition hover:bg-emerald-800">
                  <Sparkles className="w-3.5 h-3.5" /> Full Analysis
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-500 text-center">
                {inspectMode
                  ? "Click anywhere on the map to run AI inference for that coordinate."
                  : <span>Enable <strong>Click-to-Inspect</strong> to analyze any map point.</span>}
              </div>
            )}

            {/* Selected station panel */}
            {selectedLocation && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-slate-900">Selected Station</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    selectedLocation.risk_score >= 80 ? "bg-red-100 text-red-700" :
                    selectedLocation.risk_score >= 60 ? "bg-orange-100 text-orange-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{selectedLocation.risk_level ?? RC(selectedLocation.risk_score ?? 0).label}</span>
                </div>
                <div className="font-black text-slate-900 text-sm">{selectedLocation.name}</div>
                <div className="text-slate-500">{selectedLocation.state}</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-400 block">Risk</span><span className="font-black text-slate-900">{selectedLocation.risk_score}/100</span></div>
                  <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-400 block">Elevation</span><span className="font-black text-slate-900">{selectedLocation.elevation_m}m</span></div>
                  <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-400 block">Slope</span><span className="font-black text-slate-900">{selectedLocation.slope_deg}°</span></div>
                  <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-400 block">Highway</span><span className="font-black text-slate-900 truncate">{selectedLocation.highway ?? "—"}</span></div>
                </div>
                <button onClick={() => navigate(`/app/analyze?q=${encodeURIComponent(selectedLocation.name)}`)}
                  className="w-full py-1.5 bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-emerald-800 transition">
                  <Sparkles className="w-3 h-3" /> Analyze Location
                </button>
              </div>
            )}

            {/* Top risk stations mini list */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-3 py-2.5 border-b border-slate-100 text-[11px] font-black text-slate-900">
                Top Risk Stations
              </div>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {[...locations]
                  .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
                  .slice(0, 8)
                  .map((l) => {
                    const rc = RC(l.risk_score ?? 0);
                    return (
                      <button key={l.id} onClick={() => onSelectLocation?.(l)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 transition flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-slate-900 truncate">{l.name}</div>
                          <div className="text-[9px] text-slate-500 truncate">{l.state}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-black text-slate-900 font-mono">{l.risk_score}</span>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rc.stroke }} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Highway risk summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-3 py-2.5 border-b border-slate-100 text-[11px] font-black text-slate-900">
                Highway Risk Corridor
              </div>
              <div className="divide-y divide-slate-100">
                {HIGHWAYS.slice(0, 5).map((h) => (
                  <div key={h.name} className="px-3 py-2 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-900 truncate">{h.name.split("·")[0].trim()}</div>
                      <div className="text-[9px] text-slate-500 truncate">{h.name.split("·")[1]?.trim() ?? ""}</div>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                      h.risk === "CRITICAL" ? "bg-red-100 text-red-700" :
                      h.risk === "HIGH" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                    }`}>{h.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Collapse/expand side panel button */}
        <button onClick={() => setSidePanel((p) => !p)}
          className="self-start mt-1 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 transition shadow-xs">
          {sidePanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
        <div className="flex items-center gap-3">
          <span>View: <strong className="text-slate-600">{MAP_VIEWS[viewKey]?.label}</strong></span>
          <span>Hazard: <strong className="text-slate-600">{HAZARD_FILTERS.find((h) => h.key === hazardFilter)?.label}</strong></span>
          <span>Stations shown: <strong className="text-slate-600">{filteredLocs.length}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>© OpenStreetMap · CARTO · Esri · BIS IS 1893:2016</span>
        </div>
      </div>
    </div>
  );
}
