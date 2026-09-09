import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Droplets,
  Mountain,
  AlertTriangle,
  Waves,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Navigation,
  History,
  Route,
  Share2,
  Radio,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  HeartPulse,
  Milestone,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  Thermometer,
  CloudRain,
  Activity,
  Compass
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { searchLocationAndPredict, getGazetteer, analyzeRouteRisk } from "../api";
import { useAuth } from "../AuthContext";
import RiskGauge from "./RiskGauge";

export default function LocationRiskSearch({ onLocationSelected = null }) {
  const { t } = useAuth();
  
  // Tab Mode: 'location' or 'route'
  const [activeTab, setActiveTab] = useState("location");

  // Location search state
  const [query, setQuery] = useState("Darjeeling");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  // Route search state
  const [originQuery, setOriginQuery] = useState("Siliguri");
  const [destQuery, setDestQuery] = useState("Gangtok");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);

  useEffect(() => {
    handleSearch("Darjeeling");
    handleRouteAnalyze("Siliguri", "Gangtok");
  }, []);

  const handleQueryChange = async (val) => {
    setQuery(val);
    if (val.trim().length > 1) {
      try {
        const list = await getGazetteer(val);
        setSuggestions(list.slice(0, 7));
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (searchVal = null, lat = null, lon = null) => {
    const term = searchVal !== null ? searchVal : query;
    setShowSuggestions(false);
    setLoading(true);
    setDispatched(false);
    try {
      const data = await searchLocationAndPredict(term, lat, lon);
      setResult(data);
      if (onLocationSelected && data.location) {
        onLocationSelected(data.location);
      }
    } catch (e) {
      console.error("Search prediction failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteAnalyze = async (orig = null, dst = null) => {
    const fromVal = orig || originQuery;
    const toVal = dst || destQuery;
    setRouteLoading(true);
    try {
      const data = await analyzeRouteRisk(fromVal, toVal);
      setRouteResult(data);
    } catch (e) {
      console.error("Route analysis failed:", e);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setQuery(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          handleSearch("", latitude, longitude);
        },
        () => {
          alert("Could not access GPS location. Defaulting to regional center.");
        }
      );
    }
  };

  const copySMSTemplate = () => {
    if (result?.early_warning_sms_template) {
      navigator.clipboard.writeText(result.early_warning_sms_template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const simulateDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 4000);
  };

  const loc = result?.location;
  const meteo = result?.live_meteorology;
  const pred = result?.prediction;
  const ls = pred?.landslide;
  const fl = pred?.flood;
  const scorecard = result?.multi_hazard_scorecard;
  const probForecast = result?.probabilistic_forecast;
  const exposure = result?.exposure;
  const emergencyPriority = result?.emergency_priority;
  const forecast7d = result?.forecast_matrix_7d || [];
  const riskTrend = result?.risk_trend || [];
  const pastRecords = result?.past_records || [];

  const getRiskBadge = (score) => {
    if (score >= 80) return { label: "🔴 DANGER (Critical Risk)", bg: "bg-red-100 text-red-800 border-red-300 font-black ring-1 ring-red-400" };
    if (score >= 60) return { label: "🔴 DANGER (High Risk)", bg: "bg-red-100 text-red-800 border-red-300 font-black" };
    if (score >= 40) return { label: "🟡 " + t.mediumRisk, bg: "bg-amber-100 text-amber-800 border-amber-300 font-bold" };
    return { label: "🟢 DANGER FREE (Safe)", bg: "bg-emerald-100 text-emerald-800 border-emerald-300 font-black" };
  };

  return (
    <div className="space-y-5">
      {/* Search Header Banner - Clean White Professional Style */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Multi-Hazard Risk Intelligence & Early Warning Grid</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Location & Transport Corridor Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Geotechnical terrain stability, probabilistic flood inundation, and corridor vulnerability assessment.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("location")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === "location"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Location Search</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("route")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === "route"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Route className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.routeAnalysis || "Route Risk Analysis"}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Single Location Search */}
        {activeTab === "location" && (
          <div className="mt-4 relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseGPS}
                  title="Detect GPS"
                  className="px-3 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">{t.detectGPS}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>{t.searchBtn}</span>
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const displayName = item.display_name || `${item.name}, ${item.state}`;
                      setQuery(item.name);
                      handleSearch(item.name, item.lat, item.lon);
                    }}
                    className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-slate-500 text-[11px] ml-1.5 truncate">
                          {item.state ? `${item.state}` : ""}{item.country && item.country !== "India" ? `, ${item.country}` : ""}
                        </span>
                      </div>
                      {item.highway && (
                        <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                          {item.highway}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
                      {item.river && <span className="hidden md:inline text-slate-400">💧 {item.river}</span>}
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                        {item.elevation ? `${Math.round(item.elevation)}m` : "DEM"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Preset Buttons - Varied Geographies */}
            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
              <span className="text-slate-500 font-medium">Explore Terrains:</span>
              {[
                { name: "🏔️ Darjeeling", q: "Darjeeling", desc: "Himalayas" },
                { name: "🌿 Wayanad", q: "Wayanad", desc: "Western Ghats" },
                { name: "⛰️ Shimla", q: "Shimla", desc: "Himachal" },
                { name: "🏛️ Kedarnath", q: "Kedarnath", desc: "Uttarakhand" },
                { name: "🌲 Manali", q: "Manali", desc: "Kullu Valley" },
                { name: "🌊 Siliguri", q: "Siliguri", desc: "Foothills" },
                { name: "🏙️ Kolkata", q: "Kolkata", desc: "Ganges Delta" },
                { name: "🏖️ Mumbai", q: "Mumbai", desc: "Konkan Coast" },
                { name: "🏞️ Guwahati", q: "Guwahati", desc: "Brahmaputra" },
                { name: "🌄 Shillong", q: "Shillong Peak Corridor", desc: "Meghalaya" },
              ].map((chip) => (
                <button
                  key={chip.name}
                  type="button"
                  onClick={() => {
                    setQuery(chip.q);
                    handleSearch(chip.q);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 transition text-[11px] font-medium flex items-center gap-1"
                >
                  <span>{chip.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Route Corridor Analysis */}
        {activeTab === "route" && (
          <div className="mt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRouteAnalyze();
              }}
              className="grid sm:grid-cols-5 gap-2 items-center"
            >
              <div className="sm:col-span-2 relative">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">{t.origin}</span>
                <input
                  type="text"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  placeholder="e.g. Siliguri, Mumbai, Rishikesh, Manali..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2 relative">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">{t.destination}</span>
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="e.g. Gangtok, Pune, Kedarnath, Leh..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-1 pt-4 sm:pt-4">
                <button
                  type="submit"
                  disabled={routeLoading}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {routeLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Route className="w-3.5 h-3.5" />
                  )}
                  <span>{t.analyzeRouteBtn || "Analyze Corridor"}</span>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
              <span className="text-slate-500 font-medium">Popular Corridors:</span>
              {[
                { from: "Siliguri", to: "Gangtok", label: "Siliguri → Gangtok (NH-10)" },
                { from: "Rishikesh", to: "Kedarnath", label: "Rishikesh → Kedarnath (NH-107)" },
                { from: "Mumbai", to: "Pune", label: "Mumbai → Pune (NH-48)" },
                { from: "Manali", to: "Leh", label: "Manali → Leh (NH-3)" },
                { from: "Kochi", to: "Wayanad", label: "Kochi → Wayanad (NH-766)" },
                { from: "Guwahati", to: "Shillong", label: "Guwahati → Shillong (NH-6)" },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    setOriginQuery(c.from);
                    setDestQuery(c.to);
                    handleRouteAnalyze(c.from, c.to);
                  }}
                  className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-medium transition"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: ROUTE CORRIDOR ANALYSIS OUTPUT */}
      {activeTab === "route" && routeResult && (
        <div className="space-y-4 animate-fadeIn">
          {/* Corridor High-Level Summary Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {routeResult.origin} <ArrowRight className="inline w-4 h-4 mx-1 text-slate-400" /> {routeResult.destination}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Corridor Highway: <strong>{routeResult.highway}</strong> · Total Distance: <strong>{routeResult.total_distance_km} km</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  routeResult.overall_corridor_risk_score >= 65 ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                  routeResult.overall_corridor_risk_score >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {routeResult.corridor_status} (Score: {routeResult.overall_corridor_risk_score}/100)
                </span>
              </div>
            </div>

            {/* Waypoint Nodes Line Graph */}
            <div className="my-5">
              <span className="text-xs font-bold text-slate-700 mb-3 block uppercase tracking-wider">
                Corridor Elevation & Risk Waypoints (Origin → Destination)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {routeResult.waypoints.map((wp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{wp.node_code}</span>
                        <span className="text-sm">{wp.status_color}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 block mt-1 line-clamp-1">{wp.name}</span>
                      <span className="text-[10px] text-slate-500 block">Elev: {wp.elevation_m}m · Slope: {wp.slope_deg}°</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Landslide:</span>
                        <span className="font-bold text-amber-800">{wp.landslide_prob_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Flood:</span>
                        <span className="font-bold text-blue-800">{wp.flood_prob_pct}%</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Road:</span>
                        <span className={wp.road_vulnerability === "Critical" ? "text-red-700" : "text-slate-800"}>
                          {wp.road_vulnerability}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Risk Zones Along Route */}
            {routeResult.high_risk_zones && routeResult.high_risk_zones.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">{t.highRiskZones || "High Risk Zones Along Route"}</h4>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {routeResult.high_risk_zones.map((zone, i) => (
                    <div key={i} className="p-3 rounded-lg bg-red-50/50 border border-red-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{zone.zone_name}</span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px]">
                          Landslide: {zone.landslide_prob_pct}% · Flood: {zone.flood_prob_pct}%
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1 text-[11px]"><strong>Hazard Trigger:</strong> {zone.hazard_trigger}</p>
                      <p className="text-red-800 mt-0.5 text-[11px]"><strong>Action:</strong> {zone.recommended_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detour Guidance */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>{t.detourRecommendation || "Emergency Guidance"}: </strong>
                <span>{routeResult.detour_advice}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LOCATION INTELLIGENCE & MULTI-HAZARD PREDICTION OUTPUT */}
      {activeTab === "location" && result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Explicit Danger vs Danger Free Banner */}
          {scorecard?.overall_risk_score >= 60 ? (
            <div className="p-3.5 rounded-xl bg-red-600 text-white font-extrabold text-sm flex items-center justify-between shadow-xs animate-pulse">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5" />
                <span className="tracking-wide">🔴 DANGER ZONE: ELEVATED LANDSLIDE & FLOOD RISK DETECTED</span>
              </div>
              <span className="text-xs bg-red-800 text-white font-bold px-3 py-1 rounded-full border border-red-400">
                HIGH DANGER ALERT
              </span>
            </div>
          ) : scorecard?.overall_risk_score < 40 ? (
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5" />
                <span className="tracking-wide">🟢 DANGER FREE: SAFE LOCATION & STABLE TERRAIN</span>
              </div>
              <span className="text-xs bg-emerald-800 text-white font-bold px-3 py-1 rounded-full border border-emerald-400">
                ALL CLEAR / RISK FREE
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5" />
                <span className="tracking-wide">🟡 MODERATE RISK: ADVISORY & WATCH PHASE IN EFFECT</span>
              </div>
              <span className="text-xs bg-amber-700 text-white font-bold px-3 py-1 rounded-full">
                ADVISORY WATCH
              </span>
            </div>
          )}

          {/* 1. Location Intelligence Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs border-l-4 border-l-emerald-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Target Location / Place</span>
              <span className="text-sm font-bold text-slate-900 truncate block mt-0.5">{loc?.name}</span>
              <span className="text-[10px] text-slate-500">{loc?.district}, {loc?.state}</span>
              {loc?.highway && (
                <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {loc.highway}
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs border-l-4 border-l-blue-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Live IMD 24h Rain</span>
              <span className="text-base font-bold text-blue-800 block mt-0.5">{meteo?.rainfall_24h_mm} mm</span>
              <span className="text-[10px] text-slate-500">7-Day Cumulative: {meteo?.rainfall_7d_mm} mm</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Elevation & Slope</span>
              <span className="text-base font-bold text-indigo-900 block mt-0.5">{loc?.elevation_m} m</span>
              <span className="text-[10px] text-slate-500">Hill Gradient: {loc?.slope_deg}°</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs border-l-4 border-l-cyan-600">
              <span className="text-[11px] text-slate-500 font-semibold block">River Drainage Basin</span>
              <span className="text-sm font-bold text-cyan-900 block mt-0.5 truncate">{loc?.nearest_river}</span>
              <span className="text-[10px] text-slate-500">Bank Distance: {loc?.river_distance_km} km</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs border-l-4 border-l-teal-600">
              <span className="text-[11px] text-slate-500 font-semibold block">{t.soilSaturation}</span>
              <span className="text-base font-bold text-teal-800 block mt-0.5">{meteo?.soil_moisture_pct}%</span>
              <span className="text-[10px] text-slate-500">Temp: {meteo?.temperature_c}°C</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs border-l-4 border-l-purple-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Coordinates & Geocode</span>
              <span className="text-xs font-mono font-bold text-purple-900 block mt-0.5">
                {loc?.latitude?.toFixed(4)}, {loc?.longitude?.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500">High-Res Satellite Sync</span>
            </div>
          </div>

          {/* 2. Overall Multi-Hazard Scorecard & Emergency Priority */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Overall Composite Risk Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Composite Multi-Hazard Rating
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {scorecard?.overall_risk_score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskBadge(scorecard?.overall_risk_score || 0).bg}`}>
                    {getRiskBadge(scorecard?.overall_risk_score || 0).label}
                  </span>
                </div>

                {/* Sub-scores breakdown */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Flood Sub-Score</span>
                    <span className="font-bold text-blue-900">{scorecard?.flood_score}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Landslide Sub-Score</span>
                    <span className="font-bold text-amber-900">{scorecard?.landslide_score}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Road Vulnerability</span>
                    <span className="font-bold text-slate-800">{scorecard?.road_vulnerability_score}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Exposure Score</span>
                    <span className="font-bold text-slate-800">{scorecard?.population_exposure_score}/100</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                AI Confidence Level: <strong className="text-slate-800">{probForecast?.confidence_pct}%</strong>
              </div>
            </div>

            {/* Emergency Priority Classification */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">{t.emergencyPriorityTitle || "Emergency Priority"}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${emergencyPriority?.badge_color}`}>
                    {emergencyPriority?.tier}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                  {emergencyPriority?.rationale}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Triage Protocol: Automated</span>
                <span className="font-semibold text-slate-700">SDMA/NDRF Sync Active</span>
              </div>
            </div>

            {/* Population & Infrastructure Exposure Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-slate-800">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">{t.exposureTitle || "Population & Infrastructure Exposure"}</h4>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                  <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <Users className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">Population</span>
                    <span className="font-bold text-slate-900 text-xs">{exposure?.population?.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <Building2 className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">Villages</span>
                    <span className="font-bold text-slate-900 text-xs">{exposure?.villages}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <HeartPulse className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">Hospitals</span>
                    <span className="font-bold text-slate-900 text-xs">{exposure?.hospitals}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <GraduationCap className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">Schools</span>
                    <span className="font-bold text-slate-900 text-xs">{exposure?.schools}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <Milestone className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">Roads</span>
                    <span className="font-bold text-slate-900 text-xs">{exposure?.roads_km} km</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <Compass className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">Bridges</span>
                    <span className="font-bold text-slate-900 text-xs">{exposure?.bridges}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                <span>Census & OpenStreetMap Layer</span>
                <span>Buffer Radius: 5.0 km</span>
              </div>
            </div>
          </div>

          {/* 3. Probabilistic Multi-Hazard Forecasts (Landslide + Flood with 24h / 72h / 7d Windows) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {t.upcomingPredictionsTitle}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Probabilistic Estimation (Confidence: {probForecast?.confidence_pct}%)
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Landslide Probabilistic Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        <Mountain className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.landslide} Risk Assessment</h4>
                        <p className="text-[11px] text-slate-500">Geotechnical slope failure & pore-water pressure engine</p>
                      </div>
                    </div>
                    {ls && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getRiskBadge(ls.risk_score).bg}`}>
                        {getRiskBadge(ls.risk_score).label}
                      </span>
                    )}
                  </div>

                  {/* Multi-Window Probabilities */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Next 24 Hours</span>
                      <span className="text-base font-extrabold text-amber-800 block mt-0.5">
                        {probForecast?.landslide?.next_24h_prob_pct}%
                      </span>
                      <span className="text-[9px] text-slate-400">Immediate</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Next 72 Hours</span>
                      <span className="text-base font-extrabold text-amber-800 block mt-0.5">
                        {probForecast?.landslide?.next_72h_prob_pct}%
                      </span>
                      <span className="text-[9px] text-slate-400">Short-Term</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Next 7 Days</span>
                      <span className="text-base font-extrabold text-amber-800 block mt-0.5">
                        {probForecast?.landslide?.next_7d_prob_pct}%
                      </span>
                      <span className="text-[9px] text-slate-400">Medium Range</span>
                    </div>
                  </div>

                  {/* Factor Attribution (XAI) */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 mb-2 block">
                      Geotechnical Contributing Factors (Why is the risk high?)
                    </span>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ls?.explainability || []} layout="vertical" margin={{ left: 5, right: 10, top: 0, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 45]} hide />
                          <YAxis type="category" dataKey="factor" stroke="#64748b" fontSize={10} width={130} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
                            formatter={(v) => [`${v}%`, "Contribution"]}
                          />
                          <Bar dataKey="contribution_pct" fill="#d97706" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] text-slate-400 flex justify-between border-t border-slate-100">
                  <span>Model: {ls?.model_used}</span>
                  <span>Calibrated for Himalayan Metasediments</span>
                </div>
              </div>

              {/* Flood Probabilistic Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        <Waves className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.flood} Threat Prediction</h4>
                        <p className="text-[11px] text-slate-500">Hydrological river basin runoff & inundation engine</p>
                      </div>
                    </div>
                    {fl && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getRiskBadge(fl.risk_score).bg}`}>
                        {getRiskBadge(fl.risk_score).label}
                      </span>
                    )}
                  </div>

                  {/* Multi-Window Probabilities */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Next 24 Hours</span>
                      <span className="text-base font-extrabold text-blue-800 block mt-0.5">
                        {probForecast?.flood?.next_24h_prob_pct}%
                      </span>
                      <span className="text-[9px] text-slate-400">Immediate</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Next 72 Hours</span>
                      <span className="text-base font-extrabold text-blue-800 block mt-0.5">
                        {probForecast?.flood?.next_72h_prob_pct}%
                      </span>
                      <span className="text-[9px] text-slate-400">Short-Term</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Next 7 Days</span>
                      <span className="text-base font-extrabold text-blue-800 block mt-0.5">
                        {probForecast?.flood?.next_7d_prob_pct}%
                      </span>
                      <span className="text-[9px] text-slate-400">Medium Range</span>
                    </div>
                  </div>

                  {/* Factor Attribution (XAI) */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 mb-2 block">
                      Hydrological Contributing Factors (Why is the flood threat elevated?)
                    </span>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fl?.explainability || []} layout="vertical" margin={{ left: 5, right: 10, top: 0, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 45]} hide />
                          <YAxis type="category" dataKey="factor" stroke="#64748b" fontSize={10} width={130} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
                            formatter={(v) => [`${v}%`, "Contribution"]}
                          />
                          <Bar dataKey="contribution_pct" fill="#0284c7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] text-slate-400 flex justify-between border-t border-slate-100">
                  <span>Model: {fl?.model_used}</span>
                  <span>River Catchment Hydrodynamic Simulation</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Natural Language AI Explanation Summary */}
          {result?.ai_summary_explanation && (
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>{t.aiExplanationTitle || "AI Risk Attribution Summary"}: </strong>
                <span>{result.ai_summary_explanation}</span>
              </div>
            </div>
          )}

          {/* 5. 7-Day Day-by-Day Forecast & Disaster Matrix Table */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t.forecast7DaysTitle || "7-Day Day-by-Day Multi-Hazard Forecast"}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">ECMWF / IMD Model Ensemble</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Timeline</th>
                    <th className="px-3">Expected Rainfall</th>
                    <th className="px-3">Flood Risk Tier</th>
                    <th className="px-3">Landslide Risk Tier</th>
                    <th className="px-3">Est. Temperature</th>
                    <th className="px-3">Weather Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {forecast7d.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{f.day}</td>
                      <td className="px-3 font-semibold text-blue-800">{f.rainfall_mm} mm</td>
                      <td className="px-3">
                        <span className="font-semibold">{f.flood_risk}</span>
                      </td>
                      <td className="px-3">
                        <span className="font-semibold">{f.landslide_risk}</span>
                      </td>
                      <td className="px-3">{f.temp_c}°C</td>
                      <td className="px-3 text-slate-500">{f.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Historical Disaster Timeline & Risk Trend (2019 -> 2026) */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Historical Disaster Archive Table */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {t.pastRecordsTitle} ({loc?.name})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {pastRecords.length} recorded disaster events
                </span>
              </div>

              {pastRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Year</th>
                        <th className="px-2.5">Event</th>
                        <th className="px-2.5">Severity</th>
                        <th className="px-2.5">Impact Summary</th>
                        <th className="px-2.5 text-right">Fatalities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {pastRecords.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-2.5 font-bold text-slate-900">{item.year}</td>
                          <td className="px-2.5 font-semibold text-slate-800">{item.type}</td>
                          <td className="px-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.severity === "Critical" || item.severity === "Severe" ? "bg-red-50 text-red-700 border border-red-200" :
                              item.severity === "High" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                              "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.severity}
                            </span>
                          </td>
                          <td className="px-2.5 text-slate-600 max-w-xs truncate">{item.impact || item.details}</td>
                          <td className="px-2.5 text-right font-bold text-red-600">{item.casualties}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-3">{t.noPastRecords}</p>
              )}
            </div>

            {/* Risk Trend Chart (2019 -> 2026) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {t.riskTrendTitle || "Disaster Risk Trend (2019 → 2026)"}
                  </h4>
                </div>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrend}>
                      <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
                        formatter={(v) => [`${v} / 100`, "Risk Index"]}
                      />
                      <Area dataKey="risk" stroke="#047857" fill="#10b98125" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                <span>Multi-Year Climatological Shift</span>
                <span>Calibrated 2026</span>
              </div>
            </div>
          </div>

          {/* 7. Actionable Evacuation Directives & SMS Broadcast */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-slate-900 text-sm">{t.evacuationDirectives}</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">LANDGUARD Central Emergency Grid</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {result?.evacuation_directives?.map((dir, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{dir}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Channel Automated Early Warning Broadcast */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 truncate max-w-md">
                <span className="text-slate-400 font-mono text-[10px]">Auto SMS Alert: </span>
                <span className="text-slate-800 italic truncate font-medium">"{result?.early_warning_sms_template}"</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copySMSTemplate}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? t.copied : t.copySMS}</span>
                </button>

                <button
                  type="button"
                  onClick={simulateDispatch}
                  className="px-3.5 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{dispatched ? t.dispatched : t.simulateBroadcast}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
