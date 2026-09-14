import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import {
  Search,
  MapPin,
  Waves,
  Mountain,
  AlertTriangle,
  Navigation,
  Shield,
  Layers,
  Sparkles,
  Info,
  Radio,
  Globe2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { get, getFloodZones, inspectCoordinate, getGazetteer } from "../api";
import { useAuth } from "../AuthContext";
import GISRiskMap from "../components/GISRiskMap";

const NER_CENTER = [26.2, 92.9];
const INDIA_CENTER = [22.5, 80.0];

function styleLandslide(f) {
  const s = f.properties.risk_score || 0;
  const color = s >= 80 ? "#dc2626" : s >= 60 ? "#ea580c" : s >= 40 ? "#d97706" : "#059669";
  return { color, weight: 2, fillColor: color, fillOpacity: 0.25 };
}

function styleFlood(f) {
  const s = f.properties.risk_score || 0;
  const color = s >= 80 ? "#1d4ed8" : s >= 60 ? "#0284c7" : "#06b6d4";
  return { color, weight: 2, fillColor: color, fillOpacity: 0.35, dashArray: "4 4" };
}

// Sub-component to handle map click inspections
function MapClickInspector({ onInspect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onInspect(lat, lng);
    },
  });
  return null;
}

// Sub-component to animate flyTo
function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 10, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function MapPage() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const [mapMode, setMapMode] = useState("advanced"); // "advanced" | "classic"
  const [stations, setStations] = useState(null);
  const [polys, setPolys] = useState(null);
  const [floodPolys, setFloodPolys] = useState(null);
  const [sensors, setSensors] = useState(null);
  const [facs, setFacs] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [base, setBase] = useState("osm");

  // Map Search & Interactive Inspection State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchedPin, setSearchedPin] = useState(null);
  const [inspectedData, setInspectedData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  useEffect(() => {
    get("/api/map/stations").then(setStations).catch(console.error);
    get("/api/map/high-risk-polygons").then(setPolys).catch(console.error);
    getFloodZones().then(setFloodPolys).catch(console.error);
    get("/api/map/sensors").then(setSensors).catch(console.error);
    get("/api/map/facilities").then(setFacs).catch(console.error);
    get("/api/map/evacuation-routes").then(setRoutes).catch(console.error);
    get("/api/dashboard/locations").then(setLocations).catch(console.error);
  }, []);

  const handleQueryChange = async (val) => {
    setSearchQuery(val);
    if (val.trim().length > 1) {
      try {
        const list = await getGazetteer(val);
        setSuggestions(list.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    setInspectLoading(true);
    try {
      const list = await getGazetteer(searchQuery);
      if (list && list.length > 0) {
        const place = list[0];
        setSearchQuery(place.name);
        setSearchedPin([place.lat, place.lon]);
        const data = await inspectCoordinate(place.lat, place.lon);
        setInspectedData(data);
      }
    } catch (err) {
      console.error("Map search submit failed:", err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSelectLocation = async (place) => {
    setShowSuggestions(false);
    setSearchQuery(place.name);
    setSearchedPin([place.lat, place.lon]);
    setInspectLoading(true);
    try {
      const data = await inspectCoordinate(place.lat, place.lon);
      setInspectedData(data);
    } catch (e) {
      console.error("Inspect coordinate failed:", e);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleMapClick = async (lat, lon) => {
    setSearchedPin([lat, lon]);
    setInspectLoading(true);
    try {
      const data = await inspectCoordinate(lat, lon);
      setInspectedData(data);
    } catch (e) {
      console.error("Map click inspect failed:", e);
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Interactive Multi-Hazard GIS Risk Platform</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 m-0">
            Real-Time Landslide Susceptibility & River Basin Flood Inundation Map
          </h2>
          <p className="text-xs text-slate-500 m-0">
            Click anywhere on the map or search any location to run instant AI prediction on exact coordinates.
          </p>
        </div>

        {/* Map Search Bar */}
        <div className="relative w-full sm:w-80">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search any location or coordinates..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-[1500] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectLocation(item)}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    <span className="text-slate-500 text-[11px] truncate">
                      {item.state ? `(${item.state})` : ""}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-semibold px-1.5 py-0.5 rounded text-slate-600 shrink-0">
                    {item.elevation ? `${Math.round(item.elevation)}m` : "DEM"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Map Box & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[680px]">
        {/* Left / Side Inspector Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs overflow-y-auto">
          {inspectLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Running Multi-Hazard AI Model...</span>
            </div>
          ) : inspectedData ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                    Point Inspection
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {inspectedData.location.latitude.toFixed(4)}°, {inspectedData.location.longitude.toFixed(4)}°
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  {inspectedData.location.name}
                </h3>
                <p className="text-slate-500 text-[11px]">
                  {inspectedData.location.district}, {inspectedData.location.state}
                </p>
                {inspectedData.location.highway && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {inspectedData.location.highway}
                  </span>
                )}
              </div>

              {/* Landslide Card */}
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5" />
                    Landslide Risk
                  </span>
                  <span className="text-xs font-extrabold">{inspectedData.prediction.landslide.risk_score} / 100</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Probability:</span>
                  <span className="font-bold text-slate-900">{inspectedData.prediction.landslide.probability_pct}%</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Risk Level:</span>
                  <span className="font-bold text-amber-800">{inspectedData.prediction.landslide.risk_level}</span>
                </div>
              </div>

              {/* Flood Card */}
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span className="flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5" />
                    Flood Threat
                  </span>
                  <span className="text-xs font-extrabold">{inspectedData.prediction.flood.risk_score} / 100</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Inundation Chance:</span>
                  <span className="font-bold text-slate-900">{inspectedData.prediction.flood.probability_pct}%</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Water Surge:</span>
                  <span className="font-bold text-blue-800">+{inspectedData.prediction.flood.water_surge_m} m</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Nearest River:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[120px]">{inspectedData.location.nearest_river}</span>
                </div>
              </div>

              {/* Live Weather Metrics */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Live Meteorology</span>
                <div className="flex justify-between">
                  <span>24h Rainfall:</span>
                  <span className="font-bold text-slate-900">{inspectedData.live_meteorology.rainfall_24h_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Soil Moisture:</span>
                  <span className="font-bold text-slate-900">{inspectedData.live_meteorology.soil_moisture_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Elevation & Slope:</span>
                  <span className="font-bold text-slate-900">{inspectedData.location.elevation_m}m · {inspectedData.location.slope_deg}°</span>
                </div>
              </div>

              {/* Directives */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Actionable Directive</span>
                <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                  {inspectedData.evacuation_directives[0]}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-3 p-4">
              <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                <Navigation className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Interactive Risk Inspector</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Click on any mountain slope, river valley, highway pass, or search above to inspect live risk telemetry.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>IMD Radar + DEM</span>
            <span>NER Command Grid</span>
          </div>
        </div>

        {/* Right / GIS Map Area */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-xs">
          {/* Base Layer Switcher */}
          <div className="absolute z-[1000] top-3 left-14 flex gap-1.5 bg-white/95 p-1 rounded-lg border border-slate-300 shadow-sm">
            <button
              onClick={() => setBase("osm")}
              className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                base === "osm" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Standard Map
            </button>
            <button
              onClick={() => setBase("topo")}
              className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                base === "topo" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Topographic Relief
            </button>
          </div>

          <MapContainer center={NER_CENTER} zoom={7} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors / OpenTopoMap"
              url={
                base === "topo"
                  ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />

            <MapClickInspector onInspect={handleMapClick} />
            {searchedPin && <MapFlyTo position={searchedPin} />}

            {/* Clicked / Searched Coordinate Marker */}
            {searchedPin && inspectedData && (
              <Marker position={searchedPin}>
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <strong className="text-slate-900 block text-sm font-bold">{inspectedData.location.name}</strong>
                    <span className="text-slate-500 text-[11px] block">{inspectedData.location.district}, {inspectedData.location.state}</span>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between gap-3 font-semibold">
                      <span className="text-amber-700">Landslide: {inspectedData.prediction.landslide.risk_score}</span>
                      <span className="text-blue-700">Flood: {inspectedData.prediction.flood.risk_score}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            <LayersControl position="topright">
              {/* Landslide Hazard Polygons */}
              {polys && (
                <LayersControl.Overlay checked name="⛰️ Landslide Hazard Zones">
                  <GeoJSON
                    data={polys}
                    style={styleLandslide}
                    onEachFeature={(f, layer) => {
                      const p = f.properties;
                      layer.bindPopup(
                        `<div style="font-size:12px"><strong>⛰️ ${p.name}</strong><br/>Landslide Hazard Score: <strong>${p.risk_score}</strong> (${p.risk_level})</div>`
                      );
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {/* Flood Inundation Zones */}
              {floodPolys && (
                <LayersControl.Overlay checked name="🌊 Flood Inundation River Basins">
                  <GeoJSON
                    data={floodPolys}
                    style={styleFlood}
                    onEachFeature={(f, layer) => {
                      const p = f.properties;
                      layer.bindPopup(
                        `<div style="font-size:12px"><strong>🌊 ${p.name}</strong><br/>River: <strong>${p.river}</strong><br/>Flood Threat Score: <strong>${p.risk_score}</strong> (${p.risk_level})</div>`
                      );
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {/* Monitored Stations */}
              {stations && (
                <LayersControl.Overlay checked name="📍 Monitored Stations">
                  <GeoJSON
                    data={stations}
                    pointToLayer={(f, latlng) =>
                      L.circleMarker(latlng, {
                        radius: 8,
                        color: f.properties.risk_score >= 80 ? "#dc2626" : f.properties.risk_score >= 60 ? "#ea580c" : "#059669",
                        fillColor: f.properties.risk_score >= 80 ? "#fee2e2" : f.properties.risk_score >= 60 ? "#ffedd5" : "#d1fae5",
                        fillOpacity: 0.9,
                        weight: 2,
                      })
                    }
                    onEachFeature={(f, layer) => {
                      const p = f.properties;
                      layer.bindPopup(
                        `<div style="font-size:12px"><strong>${p.name}</strong><br/>${p.district}, ${p.state}<br/>Risk: <strong>${p.risk_score}</strong> (${p.risk_level})<br/>Slope: ${p.slope_deg}° · ${p.highway || ""}</div>`
                      );
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {/* IoT Sensors */}
              {sensors && (
                <LayersControl.Overlay name="📡 IoT Inclinometers & Piezometers">
                  <GeoJSON
                    data={sensors}
                    pointToLayer={(f, latlng) =>
                      L.circleMarker(latlng, {
                        radius: 5,
                        color: f.properties.status === "online" ? "#0284c7" : "#d97706",
                        fillColor: f.properties.status === "online" ? "#e0f2fe" : "#fef3c7",
                        fillOpacity: 0.9,
                        weight: 1.5,
                      })
                    }
                    onEachFeature={(f, layer) => {
                      const p = f.properties;
                      layer.bindPopup(
                        `<div style="font-size:12px"><strong>${p.code}</strong><br/>Type: ${p.type}<br/>Status: <strong>${p.status}</strong> · Battery ${p.battery_pct}%</div>`
                      );
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {/* Emergency Facilities & Shelters */}
              {facs && (
                <LayersControl.Overlay checked name="🏥 Safe Shelters & NDRF Bases">
                  <GeoJSON
                    data={facs}
                    pointToLayer={(f, latlng) =>
                      L.circleMarker(latlng, {
                        radius: 7,
                        color: f.properties.is_blocked ? "#dc2626" : f.properties.type === "ndrf_base" ? "#7c3aed" : "#0d9488",
                        fillColor: f.properties.is_blocked ? "#fee2e2" : f.properties.type === "ndrf_base" ? "#ede9fe" : "#ccfbf1",
                        fillOpacity: 0.9,
                        weight: 2,
                      })
                    }
                    onEachFeature={(f, layer) => {
                      const p = f.properties;
                      layer.bindPopup(
                        `<div style="font-size:12px"><strong>🏥 ${p.name}</strong><br/>Type: ${p.type}<br/>Contact: <strong>${p.contact || "1077"}</strong><br/>Capacity: ${p.capacity || "N/A"} · ${p.notes || ""}</div>`
                      );
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {/* Evacuation Corridors */}
              {routes && (
                <LayersControl.Overlay name="🛣️ Safe Evacuation Corridors">
                  <GeoJSON data={routes} style={{ color: "#059669", weight: 3, dashArray: "6 4" }} />
                </LayersControl.Overlay>
              )}
            </LayersControl>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
