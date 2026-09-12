import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FileText,
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
  Compass,
  Zap,
  Gauge,
  Workflow,
  ChevronRight,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { searchLocationAndPredict, getGazetteer, analyzeRouteRisk } from "../api";
import { useAuth } from "../AuthContext";
import RiskGauge from "./RiskGauge";
import AIDisasterReportModal from "./AIDisasterReportModal";
import WhatIfSimulator from "./WhatIfSimulator";
import AIChatAssistant from "./AIChatAssistant";

export default function LocationRiskSearch({ onLocationSelected = null }) {
  const { t } = useAuth();
  const navigate = useNavigate();
  
  // Tab Mode: 'location' or 'route'
  const [activeTab, setActiveTab] = useState("location");

  // Region Mode: 'all' | 'ner' | 'pan_india'
  const [regionMode, setRegionMode] = useState("all");

  // Modals & Panels
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Location search state
  const [query, setQuery] = useState("Shillong");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  // History category filter: 'all' | 'floods' | 'landslides' | 'landrisks'
  const [historyCategory, setHistoryCategory] = useState("all");

  // Richter scale interactive tier state
  const [selectedRichterTier, setSelectedRichterTier] = useState(null);

  // Route search state
  const [originQuery, setOriginQuery] = useState("Siliguri");
  const [destQuery, setDestQuery] = useState("Gangtok");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);

  useEffect(() => {
    handleSearch("Shillong");
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

  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isVoiceSearching) {
      setIsVoiceSearching(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsVoiceSearching(true);
    recognition.onend = () => setIsVoiceSearching(false);
    recognition.onerror = () => setIsVoiceSearching(false);
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      handleSearch(speechResult);
    };
    recognition.start();
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
  const seismic = result?.seismic_richter_profile;
  const categorizedHistory = result?.categorized_history || {};
  const flowchart = result?.cascading_flowchart || [];
  const upcoming = result?.upcoming_predictions || {};

  const getRiskBadge = (score) => {
    if (score >= 80) return { label: "🔴 DANGER (Critical Risk)", bg: "bg-red-100 text-red-800 border-red-300 font-black ring-1 ring-red-400" };
    if (score >= 60) return { label: "🔴 DANGER (High Risk)", bg: "bg-red-100 text-red-800 border-red-300 font-black" };
    if (score >= 40) return { label: "🟡 " + t.mediumRisk, bg: "bg-amber-100 text-amber-800 border-amber-300 font-bold" };
    return { label: "🟢 DANGER FREE (Safe)", bg: "bg-emerald-100 text-emerald-800 border-emerald-300 font-black" };
  };

  // Comparative Radar Data
  const comparativeRadarData = [
    { subject: "Landslide", score: scorecard?.landslide_score || 45, fullMark: 100 },
    { subject: "Flood", score: scorecard?.flood_score || 35, fullMark: 100 },
    { subject: "Land Risk / Subsidence", score: scorecard?.land_risk_score || 40, fullMark: 100 },
    { subject: "Seismic Vulnerability", score: scorecard?.seismic_score || 50, fullMark: 100 },
    { subject: "Road Vulnerability", score: scorecard?.road_vulnerability_score || 40, fullMark: 100 },
    { subject: "Exposure Index", score: scorecard?.population_exposure_score || 35, fullMark: 100 },
  ];

  const NER_CHIPS = [
    { name: "🏔️ Shillong (Meghalaya)", q: "Shillong" },
    { name: "⛰️ Gangtok (Sikkim)", q: "Gangtok" },
    { name: "🏞️ Guwahati (Assam)", q: "Guwahati" },
    { name: "🌲 Itanagar (Arunachal)", q: "Itanagar" },
    { name: "🌿 Aizawl (Mizoram)", q: "Aizawl" },
    { name: "🪵 Kohima (Nagaland)", q: "Kohima" },
    { name: "🌄 Imphal (Manipur)", q: "Imphal" },
    { name: "🏛️ Agartala (Tripura)", q: "Agartala" },
    { name: "🏔️ Mangan (Sikkim)", q: "Mangan" },
    { name: "🌧️ Cherrapunji (Meghalaya)", q: "Cherrapunji" },
  ];

  const PAN_INDIA_CHIPS = [
    { name: "🏔️ Darjeeling (WB)", q: "Darjeeling" },
    { name: "⚡ Kedarnath (UK)", q: "Kedarnath" },
    { name: "🚜 Joshimath (UK)", q: "Joshimath" },
    { name: "🌿 Wayanad (Kerala)", q: "Wayanad" },
    { name: "🌲 Shimla (HP)", q: "Shimla" },
    { name: "🏔️ Manali (HP)", q: "Manali" },
    { name: "🏙️ Kolkata (WB)", q: "Kolkata" },
    { name: "🌊 Mumbai (MH)", q: "Mumbai" },
    { name: "🏞️ Siliguri (WB)", q: "Siliguri" },
    { name: "🏛️ Delhi NCR", q: "Delhi" },
  ];

  const DISPLAY_CHIPS = regionMode === "ner" ? NER_CHIPS : regionMode === "pan_india" ? PAN_INDIA_CHIPS : [...NER_CHIPS.slice(0, 5), ...PAN_INDIA_CHIPS.slice(0, 5)];

  return (
    <div className="space-y-6">
      {/* Search Header Banner - Command Center Style */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Bhu-Surakha · Multi-Hazard Geo-Spatial Early Warning Platform</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Location Disaster Risk & Early Warning Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Search any location in India — state, district, city, village, or coordinates. Real-time AI terrain analysis, Richter scale seismology & historical disaster timelines.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-xl self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("location")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "location"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location AI Search</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("route")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "route"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Route className="w-4 h-4 text-blue-600" />
              <span>{t.routeAnalysis || "Route Risk Analysis"}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Single Location Search */}
        {activeTab === "location" && (
          <div className="mt-5 relative space-y-4">
            {/* Region Mode Toggle Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Region Focus:</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setRegionMode("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    regionMode === "all"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🌐 Pan-India & All
                </button>
                <button
                  type="button"
                  onClick={() => setRegionMode("ner")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    regionMode === "ner"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🏔️ NER 8-States Focus
                </button>
                <button
                  type="button"
                  onClick={() => setRegionMode("pan_india")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    regionMode === "pan_india"
                      ? "bg-purple-700 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🇮🇳 Pan-India Hotspots
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search ANY State, District, City, Town, Village, or Coordinates in India (e.g. Shillong, Gangtok, Darjeeling, Kedarnath, Kolkata)..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
                />
                {/* Voice Search Button inside input */}
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                    isVoiceSearching
                      ? "bg-rose-600 text-white animate-pulse"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                  }`}
                  title={isVoiceSearching ? "Listening... click to stop" : "Search by voice (speech recognition)"}
                >
                  <Radio className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseGPS}
                  title="Detect GPS"
                  className="px-3.5 py-3 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl flex items-center gap-1.5 transition shrink-0"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">{t.detectGPS}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{loading ? "Analyzing..." : "Analyze Location"}</span>
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(item.name);
                      handleSearch(item.name, item.lat, item.lon);
                    }}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        <span className="text-slate-500 text-xs ml-2 truncate">
                          {item.state ? `${item.state}` : ""}{item.country && item.country !== "India" ? `, ${item.country}` : ""}
                        </span>
                      </div>
                      {item.highway && (
                        <span className="hidden sm:inline px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          {item.highway}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                      {item.river && <span className="hidden md:inline text-slate-400">💧 {item.river}</span>}
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">
                        {item.elevation ? `${Math.round(item.elevation)}m` : "DEM"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap text-xs">
              <span className="text-slate-400 font-semibold">
                {regionMode === "ner" ? "NER Focus Stations:" : regionMode === "pan_india" ? "Pan-India Hotspots:" : "Suggested Hubs:"}
              </span>
              {DISPLAY_CHIPS.map((chip) => (
                <button
                  key={chip.name}
                  type="button"
                  onClick={() => {
                    setQuery(chip.q);
                    handleSearch(chip.q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 transition text-[11px] font-bold flex items-center gap-1"
                >
                  <span>{chip.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Tab 2: Route Corridor Analysis */}
        {activeTab === "route" && (
          <div className="mt-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRouteAnalyze();
              }}
              className="grid sm:grid-cols-5 gap-3 items-center"
            >
              <div className="sm:col-span-2 relative">
                <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">{t.origin}</span>
                <input
                  type="text"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  placeholder="e.g. Siliguri, Mumbai, Rishikesh..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="sm:col-span-2 relative">
                <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">{t.destination}</span>
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="e.g. Gangtok, Pune, Kedarnath..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="sm:col-span-1 pt-4">
                <button
                  type="submit"
                  disabled={routeLoading}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {routeLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Route className="w-4 h-4" />
                  )}
                  <span>{t.analyzeRouteBtn || "Analyze Corridor"}</span>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 mt-3.5 flex-wrap text-xs">
              <span className="text-slate-400 font-semibold">Popular Corridors:</span>
              {[
                { from: "Siliguri", to: "Gangtok", label: "Siliguri → Gangtok (NH-10)" },
                { from: "Guwahati", to: "Shillong", label: "Guwahati → Shillong (NH-6)" },
                { from: "Dimapur", to: "Kohima", label: "Dimapur → Kohima (NH-29)" },
                { from: "Rishikesh", to: "Kedarnath", label: "Rishikesh → Kedarnath (NH-107)" },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    setOriginQuery(c.from);
                    setDestQuery(c.to);
                    handleRouteAnalyze(c.from, c.to);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold transition"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: ROUTE CORRIDOR OUTPUT */}
      {activeTab === "route" && routeResult && (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Route className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {routeResult.origin} <ArrowRight className="inline w-4 h-4 mx-1 text-slate-400" /> {routeResult.destination}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Corridor Highway: <strong>{routeResult.highway}</strong> · Total Distance: <strong>{routeResult.total_distance_km} km</strong>
                  </span>
                </div>
              </div>

              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${
                routeResult.overall_corridor_risk_score >= 65 ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                routeResult.overall_corridor_risk_score >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {routeResult.corridor_status} (Score: {routeResult.overall_corridor_risk_score}/100)
              </span>
            </div>

            {/* Waypoints */}
            <div className="my-6">
              <span className="text-xs font-bold text-slate-700 mb-3 block uppercase tracking-wider">
                Corridor Elevation & Multi-Hazard Waypoints
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {routeResult.waypoints.map((wp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{wp.node_code}</span>
                        <span className="text-sm">{wp.status_color}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 block mt-1 line-clamp-1">{wp.name}</span>
                      <span className="text-[10px] text-slate-500 block">Elev: {wp.elevation_m}m · Slope: {wp.slope_deg}°</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] space-y-1">
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
                        <span className={wp.road_vulnerability === "Critical" ? "text-red-700 font-bold" : "text-slate-800"}>
                          {wp.road_vulnerability}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detour Advice */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>{t.detourRecommendation || "Emergency Guidance"}: </strong>
                <span>{routeResult.detour_advice}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL LOCATION INTELLIGENCE WITH RICHTER SCALE, FLOWCHART & UPCOMING FORECASTS */}
      {activeTab === "location" && result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Critical Emergency Banner if Score >= 75 */}
          {scorecard?.overall_risk_score >= 75 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white shadow-xl border-2 border-red-400/50 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-black/40 rounded-xl shrink-0">
                  <ShieldAlert className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg font-black tracking-wide text-white uppercase">
                      🔴 CRITICAL MULTI-HAZARD DISASTER ALERT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-white font-mono text-[10px] font-bold border border-white/30">
                      LEVEL: RED CRITICAL
                    </span>
                  </div>
                  <p className="text-xs text-red-100 mt-1 font-medium leading-relaxed">
                    Extreme environmental threshold breach detected in <strong>{loc?.name}, {loc?.state}</strong> (Overall Risk: <strong>{scorecard?.overall_risk_score}/100</strong>). Primary trigger: <strong>{pred?.landslide?.risk_score >= pred?.flood?.risk_score ? "Landslide & Slope Shear Instability" : "Severe Riverine / Flash Inundation"}</strong>.
                  </p>
                  <p className="text-xs text-amber-200 mt-1 font-bold">
                    ⚠️ Recommended Action: Avoid vulnerable cut slopes & low-lying bridges. District authorities placed on high emergency standby.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-red-900 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Full AI Report</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Action & Intelligence Command Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Intelligence Tools:</span>
              <span className="text-xs text-slate-500 font-medium">
                Grounded ML analysis for <strong>{loc?.name}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>📄 Download AI Disaster Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSimulator(!showSimulator)}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 border ${
                  showSimulator
                    ? "bg-amber-600 text-white border-amber-500 shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{showSimulator ? "Hide 'What If?' Simulator" : "⚡ 'What If?' Disaster Simulator"}</span>
              </button>
            </div>
          </div>

          {/* Embedded 'What If?' Simulator Panel if active */}
          {showSimulator && (
            <div className="animate-fadeIn">
              <WhatIfSimulator locationData={result} />
            </div>
          )}

          {/* Top Explicit Danger Banner */}
          {scorecard?.overall_risk_score >= 60 && scorecard?.overall_risk_score < 75 ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <span className="tracking-wide text-base">🔴 DANGER ZONE: ELEVATED MULTI-HAZARD RISK DETECTED</span>
              </div>
              <span className="text-xs bg-black/30 text-white font-bold px-4 py-1.5 rounded-full border border-white/30">
                ACTIVE EARLY WARNING ALERT
              </span>
            </div>
          ) : scorecard?.overall_risk_score < 40 ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" />
                <span className="tracking-wide text-base">🟢 DANGER FREE: SAFE LOCATION & STABLE TERRAIN</span>
              </div>
              <span className="text-xs bg-black/30 text-white font-bold px-4 py-1.5 rounded-full border border-white/30">
                ALL CLEAR / SAFE ZONE
              </span>
            </div>
          ) : scorecard?.overall_risk_score < 60 ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                <span className="tracking-wide text-base">🟡 MODERATE RISK: ADVISORY WATCH PHASE IN EFFECT</span>
              </div>
              <span className="text-xs bg-black/20 text-slate-950 font-bold px-4 py-1.5 rounded-full border border-black/20">
                ADVISORY PHASE
              </span>
            </div>
          ) : null}


          {/* 1. Location Telemetry Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs border-l-4 border-l-emerald-600" title={loc?.display_name || `${loc?.name}, ${loc?.state}, ${loc?.country || 'India'}`}>
              <span className="text-[11px] text-slate-500 font-semibold block">Target Location</span>
              <span className="text-sm font-extrabold text-slate-900 truncate block mt-0.5">{loc?.name}</span>
              <span className="text-[10px] text-slate-500 font-medium truncate block">
                {loc?.district ? `${loc?.district}, ` : ""}{loc?.state ? `${loc?.state}` : ""}{loc?.country && loc?.country !== "India" ? `, ${loc?.country}` : ""}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs border-l-4 border-l-blue-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Live 24h Rain (IMD)</span>
              <span className="text-base font-black text-blue-800 block mt-0.5">{meteo?.rainfall_24h_mm} mm</span>
              <span className="text-[10px] text-slate-500 font-medium">7D Total: {meteo?.rainfall_7d_mm} mm</span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Elevation & Slope</span>
              <span className="text-base font-black text-indigo-900 block mt-0.5">{loc?.elevation_m} m</span>
              <span className="text-[10px] text-slate-500 font-medium">Slope: {loc?.slope_deg}° gradient</span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs border-l-4 border-l-cyan-600">
              <span className="text-[11px] text-slate-500 font-semibold block">River Drainage Basin</span>
              <span className="text-sm font-extrabold text-cyan-900 block mt-0.5 truncate">{loc?.nearest_river}</span>
              <span className="text-[10px] text-slate-500 font-medium">Distance: {loc?.river_distance_km} km</span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs border-l-4 border-l-teal-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Soil Saturation</span>
              <span className="text-base font-black text-teal-800 block mt-0.5">{meteo?.soil_moisture_pct}%</span>
              <span className="text-[10px] text-slate-500 font-medium">Temp: {meteo?.temperature_c}°C</span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs border-l-4 border-l-purple-600">
              <span className="text-[11px] text-slate-500 font-semibold block">Seismic Zone</span>
              <span className="text-xs font-black text-purple-900 block mt-0.5 truncate">
                {seismic?.seismic_zone ? seismic.seismic_zone.split("(")[0] : "Zone V"}
              </span>
              <span className="text-[10px] text-purple-700 font-bold">PGA: {seismic?.pga_g}g</span>
            </div>
          </div>

          {/* 2. RICHTER SCALE & SEISMIC INTENSITY DIAGRAM SECTION */}
          {seismic && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                    <Activity className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {t.richterScaleTitle || "Richter Scale & Seismic Intensity Meter"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Tectonic fault line proximity, simulated ground motion on Richter scale & co-seismic landslide vulnerability.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-xs font-bold">
                    {seismic.seismic_zone}
                  </span>
                </div>
              </div>

              {/* Richter Scale Visual Magnitude Gradient Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Richter Scale Magnitude ($M_L$) Diagram:</span>
                  <span className="text-purple-700 font-black">
                    Current Simulated Baseline: M {seismic.current_simulated_richter} Richter
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="relative h-6 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-300">
                  <div className="w-[20%] bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white" title="0.0 - 2.9 Micro">0 - 2.9</div>
                  <div className="w-[15%] bg-teal-500 flex items-center justify-center text-[10px] font-black text-white" title="3.0 - 3.9 Minor">3.0 - 3.9</div>
                  <div className="w-[15%] bg-amber-500 flex items-center justify-center text-[10px] font-black text-white" title="4.0 - 4.9 Light">4.0 - 4.9</div>
                  <div className="w-[15%] bg-orange-500 flex items-center justify-center text-[10px] font-black text-white" title="5.0 - 5.9 Moderate">5.0 - 5.9</div>
                  <div className="w-[15%] bg-rose-600 flex items-center justify-center text-[10px] font-black text-white" title="6.0 - 6.9 Strong">6.0 - 6.9</div>
                  <div className="w-[10%] bg-red-700 flex items-center justify-center text-[10px] font-black text-white" title="7.0 - 7.9 Major">7.0 - 7.9</div>
                  <div className="w-[10%] bg-purple-900 flex items-center justify-center text-[10px] font-black text-white" title="8.0+ Great">8.0+</div>
                </div>

                {/* Co-seismic trigger marker */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Micro Tremor (Safe)</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded border border-amber-300">
                    ⚡ Co-Seismic Slope Failure Trigger Limit: M ≥ {seismic.coseismic_threshold_richter} Richter
                  </span>
                  <span>Catastrophic (Great)</span>
                </div>
              </div>

              {/* Seismic Details Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Fault Line System</span>
                  <span className="text-xs font-bold text-slate-900 block mt-1">{seismic.fault_line_proximity}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Max Historical Magnitude</span>
                  <span className="text-sm font-black text-red-700 block mt-1">M {seismic.max_historical_richter} Richter</span>
                  <span className="text-[9px] text-slate-400">Great Historical Earthquake</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Peak Ground Accel (PGA)</span>
                  <span className="text-sm font-black text-purple-900 block mt-1">{seismic.pga_g} g</span>
                  <span className="text-[9px] text-slate-400">Mercalli: {seismic.mercalli_intensity}</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                  <span className="text-[10px] text-purple-700 font-semibold block">Co-Seismic Slope Status</span>
                  <span className="text-xs font-bold text-purple-950 block mt-1">{seismic.coseismic_status}</span>
                </div>
              </div>

              {/* Interactive Richter Scale Breakdown Cards */}
              <div>
                <span className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">
                  Richter Magnitude Scale Reference & Impact Hierarchy:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {seismic.richter_scale_levels?.map((lvl, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        selectedRichterTier === idx ? "ring-2 ring-purple-600 bg-purple-50/90" : lvl.bg
                      }`}
                      onClick={() => setSelectedRichterTier(selectedRichterTier === idx ? null : idx)}
                    >
                      <div className="font-extrabold text-[11px]">{lvl.range}</div>
                      <div className="text-[10px] font-bold mt-0.5 truncate">{lvl.label}</div>
                      <div className="text-[9px] text-slate-600 mt-1 line-clamp-2">{lvl.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. CASCADING MULTI-HAZARD RISK FLOWCHART */}
          {flowchart.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Workflow className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {t.flowchartTitle || "Cascading Multi-Hazard Risk Flowchart"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Dynamic multi-stage disaster pathway: Trigger Shock → Hydrological/Geotechnical Reaction → Hazard Manifestation → AI Mitigation.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                  5-Stage Flowchart
                </span>
              </div>

              {/* Flowchart Steps with Arrow Connectors */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {flowchart.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between relative group hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Step {step.step_number}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">{step.badge}</span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{step.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/80 text-[10px]">
                      {step.metrics?.map((m, mIdx) => (
                        <div key={mIdx} className="flex justify-between items-center">
                          <span className="text-slate-500">{m.label}:</span>
                          <span className="font-bold text-slate-800 text-right truncate max-w-[110px]">{m.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. UPCOMING MULTI-HAZARD PREDICTIONS (UPCOMING FLOOD, LANDSLIDE, LAND RISK) */}
          {upcoming && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black tracking-tight">
                    {t.upcomingPredictionsTitle} (Upcoming Multi-Hazard Forecast)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Confidence: <strong>{probForecast?.confidence_pct}%</strong>
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* 1. Upcoming Flood Prediction */}
                {upcoming.upcoming_flood && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            <Waves className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{t.upcomingFlood || "Upcoming Flood"}</h4>
                            <span className="text-[10px] text-slate-500">River Basin Inundation</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {upcoming.upcoming_flood.risk_tier}
                        </span>
                      </div>

                      {/* Multi-Window Probabilities */}
                      <div className="grid grid-cols-3 gap-2 my-3 text-center">
                        <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                          <span className="text-[9px] text-slate-500 block">Next 24h</span>
                          <span className="text-base font-black text-blue-800 block">{upcoming.upcoming_flood.prob_24h}%</span>
                          <span className="text-[8px] text-slate-400">Immediate</span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                          <span className="text-[9px] text-slate-500 block">Next 72h</span>
                          <span className="text-base font-black text-blue-800 block">{upcoming.upcoming_flood.prob_72h}%</span>
                          <span className="text-[8px] text-slate-400">Short-Term</span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                          <span className="text-[9px] text-slate-500 block">Next 7d</span>
                          <span className="text-base font-black text-blue-800 block">{upcoming.upcoming_flood.prob_7d}%</span>
                          <span className="text-[8px] text-slate-400">Medium</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Discharge Trajectory:</span>
                          <span className="font-bold text-blue-900">{upcoming.upcoming_flood.river_discharge_forecast}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dyke Integrity:</span>
                          <span className="font-bold text-slate-800">{upcoming.upcoming_flood.dyke_integrity_status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
                      <span>Hydrodynamic Model</span>
                      <span>Lead Time: {upcoming.upcoming_flood.lead_time_hours}h</span>
                    </div>
                  </div>
                )}

                {/* 2. Upcoming Landslide Prediction */}
                {upcoming.upcoming_landslide && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            <Mountain className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{t.upcomingLandslide || "Upcoming Landslide"}</h4>
                            <span className="text-[10px] text-slate-500">Slope Shear Failure</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {upcoming.upcoming_landslide.risk_tier}
                        </span>
                      </div>

                      {/* Multi-Window Probabilities */}
                      <div className="grid grid-cols-3 gap-2 my-3 text-center">
                        <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="text-[9px] text-slate-500 block">Next 24h</span>
                          <span className="text-base font-black text-amber-800 block">{upcoming.upcoming_landslide.prob_24h}%</span>
                          <span className="text-[8px] text-slate-400">Immediate</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="text-[9px] text-slate-500 block">Next 72h</span>
                          <span className="text-base font-black text-amber-800 block">{upcoming.upcoming_landslide.prob_72h}%</span>
                          <span className="text-[8px] text-slate-400">Short-Term</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="text-[9px] text-slate-500 block">Next 7d</span>
                          <span className="text-base font-black text-amber-800 block">{upcoming.upcoming_landslide.prob_7d}%</span>
                          <span className="text-[8px] text-slate-400">Medium</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Factor of Safety ($F_s$):</span>
                          <span className={`font-bold ${upcoming.upcoming_landslide.factor_of_safety_fs < 1.0 ? "text-red-700 font-black" : "text-slate-900"}`}>
                            {upcoming.upcoming_landslide.factor_of_safety_fs} {upcoming.upcoming_landslide.factor_of_safety_fs < 1.0 ? "(Unstable)" : "(Stable)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Critical Pore Pressure:</span>
                          <span className="font-bold text-slate-800">{upcoming.upcoming_landslide.critical_pore_pressure}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
                      <span>Geotechnical Inclinometer Grid</span>
                      <span>Lead Time: {upcoming.upcoming_landslide.lead_time_hours}h</span>
                    </div>
                  </div>
                )}

                {/* 3. Upcoming Land Risk & Subsidence Prediction */}
                {upcoming.upcoming_landrisk && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{t.upcomingLandrisk || "Upcoming Land Risk"}</h4>
                            <span className="text-[10px] text-slate-500">Subsidence & Toe Scour</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {upcoming.upcoming_landrisk.risk_tier}
                        </span>
                      </div>

                      {/* Multi-Window Probabilities */}
                      <div className="grid grid-cols-3 gap-2 my-3 text-center">
                        <div className="p-2 rounded-lg bg-teal-50/50 border border-teal-100">
                          <span className="text-[9px] text-slate-500 block">Next 24h</span>
                          <span className="text-base font-black text-teal-800 block">{upcoming.upcoming_landrisk.prob_24h}%</span>
                          <span className="text-[8px] text-slate-400">Immediate</span>
                        </div>
                        <div className="p-2 rounded-lg bg-teal-50/50 border border-teal-100">
                          <span className="text-[9px] text-slate-500 block">Next 72h</span>
                          <span className="text-base font-black text-teal-800 block">{upcoming.upcoming_landrisk.prob_72h}%</span>
                          <span className="text-[8px] text-slate-400">Short-Term</span>
                        </div>
                        <div className="p-2 rounded-lg bg-teal-50/50 border border-teal-100">
                          <span className="text-[9px] text-slate-500 block">Next 7d</span>
                          <span className="text-base font-black text-teal-800 block">{upcoming.upcoming_landrisk.prob_7d}%</span>
                          <span className="text-[8px] text-slate-400">Medium</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Toe Scour Rate:</span>
                          <span className="font-bold text-teal-900">{upcoming.upcoming_landrisk.soil_scour_rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Foundation Settlement:</span>
                          <span className="font-bold text-slate-800">{upcoming.upcoming_landrisk.foundation_settlement_risk}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
                      <span>InSAR Satellite Interferometry</span>
                      <span>Lead Time: {upcoming.upcoming_landrisk.lead_time_hours}h</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. MULTI-HAZARD COMPARATIVE DIAGRAM & AI ATTRIBUTION */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Comparative Radar Diagram */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Multi-Hazard Distribution Diagram
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Radar Profile</span>
                </div>

                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={comparativeRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
                      <Radar name="Hazard Severity" dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.35} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", fontSize: "11px" }}
                        formatter={(v) => [`${v} / 100`, "Risk Score"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                <span>Integrated Disaster Risk Matrix</span>
                <span>Max: 100</span>
              </div>
            </div>

            {/* AI Risk Attribution Summary Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {t.aiExplanationTitle || "AI Risk Attribution & Geotechnical Drivers"}
                  </h4>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/70 mb-3">
                  {result?.ai_summary_explanation}
                </p>

                {/* Landslide & Flood Factor Breakdown Bars */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 block mb-1">Landslide Trigger Contributions:</span>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ls?.explainability?.slice(0, 3) || []} layout="vertical">
                          <XAxis type="number" domain={[0, 45]} hide />
                          <YAxis type="category" dataKey="factor" stroke="#64748b" fontSize={9} width={100} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
                            formatter={(v) => [`${v}%`, "Contribution"]}
                          />
                          <Bar dataKey="contribution_pct" fill="#d97706" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-blue-800 block mb-1">Flood Inundation Drivers:</span>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fl?.explainability?.slice(0, 3) || []} layout="vertical">
                          <XAxis type="number" domain={[0, 45]} hide />
                          <YAxis type="category" dataKey="factor" stroke="#64748b" fontSize={9} width={100} tickLine={false} />
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
              </div>

              <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
                <span>Shapley Feature Attribution (XAI)</span>
                <span>Calibrated for Himalayan & NER Basin Geology</span>
              </div>
            </div>
          </div>

          {/* 6. CATEGORIZED PREVIOUS DISASTERS (PREVIOUS FLOOD, LANDSLIDE, LAND RISK) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {t.pastRecordsTitle} ({loc?.name})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Verified historical disaster database archives for floods, landslides, and ground subsidence.
                  </p>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setHistoryCategory("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    historyCategory === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({categorizedHistory.total_historical_events || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryCategory("floods")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    historyCategory === "floods" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌊 {t.previousFloods || "Floods"} ({categorizedHistory.past_floods?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryCategory("landslides")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    historyCategory === "landslides" ? "bg-white text-amber-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏔️ {t.previousLandslides || "Landslides"} ({categorizedHistory.past_landslides?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryCategory("landrisks")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    historyCategory === "landrisks" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🚜 {t.previousLandrisks || "Land Risk"} ({categorizedHistory.past_landrisks?.length || 0})
                </button>
              </div>
            </div>

            {/* Render Category Tables / Cards */}
            <div className="grid md:grid-cols-3 gap-3">
              {/* Previous Floods */}
              {(historyCategory === "all" || historyCategory === "floods") && (
                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between font-extrabold text-blue-900 text-xs">
                    <span className="flex items-center gap-1.5"><Waves className="w-4 h-4 text-blue-700" /> {t.previousFloods || "Previous Floods"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">{categorizedHistory.past_floods?.length || 0} Events</span>
                  </div>

                  {categorizedHistory.past_floods && categorizedHistory.past_floods.length > 0 ? (
                    <div className="space-y-2">
                      {categorizedHistory.past_floods.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-blue-100 shadow-xs text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900 font-black">{item.year} · {item.type}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">{item.severity}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{item.details}</p>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Water Level: <strong>{item.water_level}</strong></span>
                            <span className="text-red-600 font-bold">Casualties: {item.casualties}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">No major historic flood events recorded for this exact ridge.</p>
                  )}
                </div>
              )}

              {/* Previous Landslides */}
              {(historyCategory === "all" || historyCategory === "landslides") && (
                <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between font-extrabold text-amber-900 text-xs">
                    <span className="flex items-center gap-1.5"><Mountain className="w-4 h-4 text-amber-700" /> {t.previousLandslides || "Previous Landslides"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">{categorizedHistory.past_landslides?.length || 0} Events</span>
                  </div>

                  {categorizedHistory.past_landslides && categorizedHistory.past_landslides.length > 0 ? (
                    <div className="space-y-2">
                      {categorizedHistory.past_landslides.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-amber-100 shadow-xs text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900 font-black">{item.year} · {item.type}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">{item.severity}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{item.details}</p>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Trigger: <strong>{item.trigger_mechanism || "Heavy rain"}</strong></span>
                            <span className="text-red-600 font-bold">Casualties: {item.casualties}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">No massive historical slope failure on record for this point.</p>
                  )}
                </div>
              )}

              {/* Previous Land Risk & Subsidence */}
              {(historyCategory === "all" || historyCategory === "landrisks") && (
                <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 space-y-2.5">
                  <div className="flex items-center justify-between font-extrabold text-teal-900 text-xs">
                    <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-teal-700" /> {t.previousLandrisks || "Previous Land Risk"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">{categorizedHistory.past_landrisks?.length || 0} Events</span>
                  </div>

                  {categorizedHistory.past_landrisks && categorizedHistory.past_landrisks.length > 0 ? (
                    <div className="space-y-2">
                      {categorizedHistory.past_landrisks.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-teal-100 shadow-xs text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900 font-black">{item.year} · {item.type}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">{item.severity}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{item.details}</p>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Displacement: <strong>{item.erosion_rate || "Surface erosion"}</strong></span>
                            <span className="text-red-600 font-bold">Casualties: {item.casualties}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">Ground formation historically stable with baseline erosion.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 7. 7-DAY DAY-BY-DAY FORECAST MATRIX & MULTI-CHANNEL SMS ALERT */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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

            {/* Multi-Channel Automated Early Warning Broadcast */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 truncate max-w-lg">
                <span className="text-slate-400 font-mono text-[10px]">Auto SMS Alert: </span>
                <span className="text-slate-800 italic truncate font-semibold">"{result?.early_warning_sms_template}"</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copySMSTemplate}
                  className="px-3.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? t.copied : t.copySMS}</span>
                </button>

                <button
                  type="button"
                  onClick={simulateDispatch}
                  className="px-4 py-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{dispatched ? t.dispatched : t.simulateBroadcast}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Disaster Intelligence Full Report Modal */}
      <AIDisasterReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        locationData={result}
        query={query}
      />

      {/* Grounded Live AI Assistant Drawer */}
      <AIChatAssistant locationData={result} />
    </div>
  );
}

