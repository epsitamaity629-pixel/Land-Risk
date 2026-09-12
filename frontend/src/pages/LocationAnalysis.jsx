import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Sparkles, Navigation, Radio, ShieldAlert, Shield,
  AlertTriangle, Waves, Mountain, Activity, CloudRain, Thermometer,
  Clock, TrendingUp, TrendingDown, ArrowRight, ChevronDown, ChevronUp,
  Info, Users, Building2, GraduationCap, HeartPulse, Milestone,
  FileText, Download, Share2, RefreshCw, CheckCircle2, Zap, Globe2,
  BarChart3, Calendar, Layers, Gauge, ArrowUpRight, Eye
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from "recharts";
import { searchLocationAndPredict, getGazetteer, simulateScenario, generateAIReport } from "../api";
import RiskGauge from "../components/RiskGauge";
import AIDisasterReportModal from "../components/AIDisasterReportModal";
import WhatIfSimulator from "../components/WhatIfSimulator";
import AIChatAssistant from "../components/AIChatAssistant";

// ─── Helpers ────────────────────────────────────────────────────────────────
const riskColor = (score) => {
  if (score >= 80) return { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", badge: "bg-red-600 text-white", label: "CRITICAL", dot: "bg-red-600" };
  if (score >= 60) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-500 text-white", label: "HIGH", dot: "bg-orange-500" };
  if (score >= 40) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-400 text-black", label: "MODERATE", dot: "bg-amber-400" };
  return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-600 text-white", label: "LOW", dot: "bg-emerald-500" };
};

const RiskCard = ({ icon: Icon, label, score, sub, iconColor }) => {
  const rc = riskColor(score ?? 0);
  return (
    <div className={`p-4 rounded-xl border ${rc.bg} ${rc.border} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className={`p-1.5 rounded-lg bg-white/80 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${rc.badge}`}>{rc.label}</span>
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900">{score ?? "--"}<span className="text-sm font-medium text-slate-500">/100</span></div>
        <div className="text-xs font-bold text-slate-700">{label}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
        <div className={`h-full ${rc.dot} rounded-full transition-all`} style={{ width: `${score ?? 0}%` }} />
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LocationAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get("q") || "Shillong");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isVoice, setIsVoice] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [historyFilter, setHistoryFilter] = useState("all");

  const doSearch = useCallback(async (q, lat = null, lon = null) => {
    if (!q?.trim()) return;
    setLoading(true);
    setShowSug(false);
    try {
      const data = await searchLocationAndPredict(q, lat, lon);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    } else {
      doSearch("Shillong");
    }
  }, [searchParams]);

  const handleAutocomplete = async (val) => {
    setQuery(val);
    if (val.length > 1) {
      try {
        const list = await getGazetteer(val);
        setSuggestions(list.slice(0, 7));
        setShowSug(true);
      } catch (_) {}
    } else {
      setShowSug(false);
    }
  };

  const useGPS = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        const q = `GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        setQuery(q);
        doSearch("", coords.latitude, coords.longitude);
      },
      () => alert("GPS unavailable.")
    );
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice not supported in this browser.");
    const r = new SR();
    r.lang = "en-IN";
    r.onstart = () => setIsVoice(true);
    r.onend = () => setIsVoice(false);
    r.onerror = () => setIsVoice(false);
    r.onresult = (e) => {
      const s = e.results[0][0].transcript;
      setQuery(s);
      doSearch(s);
    };
    r.start();
  };

  // Destructure result
  const loc = result?.location;
  const meteo = result?.live_meteorology;
  const pred = result?.prediction;
  const sc = result?.multi_hazard_scorecard;
  const seismic = result?.seismic_richter_profile;
  const history = result?.categorized_history || {};
  const forecast7d = result?.forecast_matrix_7d || [];
  const riskTrend = result?.risk_trend || [];
  const exposure = result?.exposure || {};
  const flowchart = result?.cascading_flowchart || [];
  const upcoming = result?.upcoming_predictions || {};
  const aiObs = result?.ai_observation || "";

  const allHistory = [
    ...(history.floods || []),
    ...(history.landslides || []),
    ...(history.land_risks || []),
  ].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  const filteredHistory = historyFilter === "all" ? allHistory :
    historyFilter === "floods" ? (history.floods || []) :
    historyFilter === "landslides" ? (history.landslides || []) :
    (history.land_risks || []);

  const overallScore = sc?.overall_risk_score ?? 0;
  const rc = riskColor(overallScore);

  const PRESET_CHIPS = [
    "Shillong", "Gangtok", "Guwahati", "Darjeeling", "Kedarnath",
    "Itanagar", "Aizawl", "Kohima", "Imphal", "Agartala",
    "Wayanad", "Joshimath", "Cherrapunji", "Mangan"
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* ── Search Header ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Location Disaster Risk & Early Warning Intelligence</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-3">Analyze Any Location Across India</h1>

        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="relative">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleAutocomplete(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSug(true)}
                placeholder="Search any state, district, city, town, village or coordinates in India..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
              <button type="button" onClick={startVoice}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${isVoice ? "bg-red-600 text-white animate-pulse" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"}`}>
                <Radio className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={useGPS}
                className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition">
                <Navigation className="w-4 h-4 text-blue-600" /> GPS
              </button>
              <button type="submit" disabled={loading}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze
              </button>
            </div>
          </div>

          {/* Autocomplete */}
          {showSug && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => { setQuery(s.name); setShowSug(false); doSearch(s.name, s.lat, s.lon); }}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 text-xs border-b border-slate-100 last:border-0">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900">{s.name}</span>
                    {s.state && <span className="text-slate-500 ml-1.5">{s.state}</span>}
                  </div>
                  {s.elevation && <span className="text-slate-400 font-mono text-[10px]">{Math.round(s.elevation)}m</span>}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {PRESET_CHIPS.map((c) => (
            <button key={c} onClick={() => { setQuery(c); doSearch(c); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      {loading && (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderWidth: 3 }} />
          <p className="text-sm font-bold text-slate-700">Analyzing location — fetching live weather, terrain, seismic & historical data...</p>
          <p className="text-xs text-slate-500">Running multi-hazard ML inference...</p>
        </div>
      )}

      {!loading && result && (
        <>
          {/* ── Critical Alert Banner ─── */}
          {overallScore >= 75 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-700 to-rose-800 text-white border-2 border-red-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse shadow-xl">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-base block">🔴 CRITICAL MULTI-HAZARD ALERT — {loc?.name}, {loc?.state}</span>
                  <p className="text-red-100 text-xs mt-0.5">Overall risk: <strong>{overallScore}/100</strong>. Authorities recommend heightened preparedness and monitoring of vulnerable infrastructure.</p>
                </div>
              </div>
              <button onClick={() => setShowReport(true)}
                className="px-4 py-2 bg-white hover:bg-red-50 text-red-900 font-black text-xs rounded-xl shrink-0 flex items-center gap-1.5 transition">
                <FileText className="w-3.5 h-3.5" /> Full AI Report
              </button>
            </div>
          )}

          {/* ── Location Header ─── */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <MapPin className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{loc?.name}</h2>
                  <p className="text-sm text-slate-600 font-medium">{loc?.state}{loc?.district ? `, ${loc.district}` : ""} · India</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{loc?.latitude?.toFixed(4)}°N, {loc?.longitude?.toFixed(4)}°E</span>
                    {loc?.elevation_m && <span className="flex items-center gap-1"><Mountain className="w-3.5 h-3.5 text-slate-400" />{loc.elevation_m}m elevation</span>}
                    {seismic?.seismic_zone && <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-slate-400" />{seismic.seismic_zone}</span>}
                    {loc?.river && <span className="flex items-center gap-1"><Waves className="w-3.5 h-3.5 text-slate-400" />Near {loc.river}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setShowReport(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow">
                  <FileText className="w-3.5 h-3.5" /> AI Report
                </button>
                <button onClick={() => setShowSimulator(!showSimulator)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition">
                  <Zap className="w-3.5 h-3.5" /> What-If?
                </button>
                <button onClick={() => navigate(`/app/compare?a=${loc?.name}`)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition">
                  <BarChart3 className="w-3.5 h-3.5" /> Compare
                </button>
              </div>
            </div>
          </div>

          {/* ── PAST / PRESENT / FUTURE Three-Column ─── */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* PAST */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-slate-100"><Clock className="w-4 h-4 text-slate-600" /></div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">PAST</span>
                  <span className="text-xs font-black text-slate-900">Historical Disaster Record</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-slate-600 font-medium flex items-center gap-1"><Waves className="w-3.5 h-3.5 text-blue-500" /> Flood Events</span>
                  <span className="font-black text-blue-800">{(history.floods || []).length}</span>
                </div>
                <div className="flex justify-between p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-slate-600 font-medium flex items-center gap-1"><Mountain className="w-3.5 h-3.5 text-amber-600" /> Landslide Events</span>
                  <span className="font-black text-amber-800">{(history.landslides || []).length}</span>
                </div>
                <div className="flex justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-slate-600 font-medium flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-purple-600" /> Other Events</span>
                  <span className="font-black text-purple-800">{(history.land_risks || []).length}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-bold">Total Cataloged</span>
                  <span className="font-black text-slate-900">{allHistory.length} events</span>
                </div>
                {allHistory.length > 0 && (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Most Recent</span>
                    <span className="font-bold text-slate-900 text-xs">{allHistory[0]?.event_type ?? "Disaster"} — {allHistory[0]?.year ?? "Recent"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* PRESENT */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-emerald-100"><Activity className="w-4 h-4 text-emerald-700" /></div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">PRESENT</span>
                  <span className="text-xs font-black text-slate-900">Current Risk Conditions</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Overall Risk", val: overallScore, unit: "/100", color: rc.text },
                  { label: "24h Rainfall", val: meteo?.rainfall_24h_mm, unit: " mm", color: "text-blue-700" },
                  { label: "7d Rainfall", val: meteo?.rainfall_7d_mm, unit: " mm", color: "text-blue-600" },
                  { label: "Soil Moisture", val: meteo?.soil_moisture_pct ? `${meteo.soil_moisture_pct}%` : "--", unit: "", color: "text-teal-700" },
                  { label: "Temperature", val: meteo?.temperature_c, unit: "°C", color: "text-amber-700" },
                  { label: "Humidity", val: meteo?.humidity_pct, unit: "%", color: "text-sky-700" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600 font-medium">{r.label}</span>
                    <span className={`font-black ${r.color}`}>{r.val ?? "--"}{r.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FUTURE */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-purple-100"><TrendingUp className="w-4 h-4 text-purple-700" /></div>
                <div>
                  <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">FUTURE</span>
                  <span className="text-xs font-black text-slate-900">AI-Estimated Risk Outlook</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {upcoming?.next_24h && (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Next 24 Hours</span>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-600">Flood</span>
                      <span className="font-black text-blue-700">{upcoming.next_24h.flood_prob_pct ?? "--"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Landslide</span>
                      <span className="font-black text-amber-700">{upcoming.next_24h.landslide_prob_pct ?? "--"}%</span>
                    </div>
                  </div>
                )}
                {upcoming?.next_72h && (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Next 72 Hours</span>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-600">Flood</span>
                      <span className="font-black text-blue-700">{upcoming.next_72h.flood_prob_pct ?? "--"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Landslide</span>
                      <span className="font-black text-amber-700">{upcoming.next_72h.landslide_prob_pct ?? "--"}%</span>
                    </div>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block mb-1">Model Disclaimer</span>
                  <p className="text-[10px] text-amber-900 leading-relaxed">These are model-estimated probabilities, not guaranteed predictions. Always follow official NDMA/IMD advisories.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Overall Risk Scorecard ─── */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-4">Multi-Hazard Risk Scorecard</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="sm:col-span-2 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                <RiskGauge score={overallScore} label="Overall Risk" />
                <span className={`mt-2 text-xs font-black ${rc.text}`}>{rc.label} RISK</span>
              </div>
              <RiskCard icon={Mountain} label="Landslide" score={sc?.landslide_score} sub="Slope instability index" iconColor="text-amber-700" />
              <RiskCard icon={Waves} label="Flood" score={sc?.flood_score} sub="Riverine/flash flood risk" iconColor="text-blue-700" />
              <RiskCard icon={Activity} label="Seismic" score={sc?.seismic_score} sub={`Zone: ${seismic?.seismic_zone ?? "--"}`} iconColor="text-purple-700" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              <RiskCard icon={CloudRain} label="Extreme Rainfall" score={sc?.extreme_rainfall_score} sub="Cumulative rainfall index" iconColor="text-sky-700" />
              <RiskCard icon={Mountain} label="Road Vulnerability" score={sc?.road_vulnerability_score} sub="Highway corridor risk" iconColor="text-orange-700" />
              <RiskCard icon={Users} label="Population Exposure" score={sc?.population_exposure_score} sub="Estimated exposed assets" iconColor="text-rose-700" />
              <RiskCard icon={Shield} label="Land Stability" score={sc?.land_risk_score} sub="Subsidence & erosion" iconColor="text-emerald-700" />
            </div>
          </div>

          {/* ── Why at Risk (XAI) ─── */}
          {pred?.landslide?.factors && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900">Why is {loc?.name} at Risk? — Explainable AI</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {/* Landslide XAI */}
                <div>
                  <h4 className="text-xs font-bold text-amber-700 mb-3 flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5" /> Landslide Risk Drivers
                  </h4>
                  <div className="space-y-2">
                    {pred.landslide.factors.map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 font-medium">{f.factor ?? f.name}</span>
                          <span className="font-black text-amber-700">{f.percentage ?? f.pct ?? f.contribution}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${f.percentage ?? f.pct ?? f.contribution}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Flood XAI */}
                {pred?.flood?.factors && (
                  <div>
                    <h4 className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5" /> Flood Risk Drivers
                    </h4>
                    <div className="space-y-2">
                      {pred.flood.factors.map((f, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-700 font-medium">{f.factor ?? f.name}</span>
                            <span className="font-black text-blue-700">{f.percentage ?? f.pct ?? f.contribution}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full" style={{ width: `${f.percentage ?? f.pct ?? f.contribution}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── AI Observation ─── */}
          {aiObs && (
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Disaster Intelligence — {loc?.name}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">{aiObs}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result?.recommended_actions?.slice(0, 4).map((a, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Seismic Module ─── */}
          {seismic && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Activity className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-black text-slate-900">Earthquake & Seismic Profile — {loc?.name}</h3>
                <span className="text-[10px] text-slate-400 font-medium ml-auto">BIS IS 1893:2016</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {[
                  { label: "Seismic Zone", val: seismic.seismic_zone, color: "text-purple-700" },
                  { label: "Zone Factor (Z)", val: seismic.zone_factor, color: "text-slate-900" },
                  { label: "Design PGA", val: seismic.design_pga ? `${seismic.design_pga}g` : "--", color: "text-orange-700" },
                  { label: "Last M5+ Event", val: seismic.last_notable_event ?? "Historical", color: "text-slate-700" },
                  { label: "Co-seismic Risk", val: seismic.co_seismic_landslide_risk ?? "--", color: "text-red-700" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">{s.label}</span>
                    <span className={`font-black text-sm mt-1 block ${s.color}`}>{s.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900">
                <strong>⚠️ Important:</strong> {seismic.disclaimer ?? "Exact earthquake prediction is scientifically impossible. The seismic zone classification reflects historical frequency and BIS standards, not a guarantee of future events."}
              </div>
            </div>
          )}

          {/* ── 7-Day Forecast ─── */}
          {forecast7d.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 mb-3">7-Day Multi-Hazard Forecast</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecast7d} margin={{ left: -10 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#475569" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, color: "#fff", fontSize: 11 }}
                      formatter={(v, n) => [`${v}`, n === "landslide_risk" ? "Landslide Risk" : "Flood Risk"]} />
                    <Bar dataKey="landslide_risk" fill="#f59e0b" radius={[3, 3, 0, 0]} name="landslide_risk" />
                    <Bar dataKey="flood_risk" fill="#3b82f6" radius={[3, 3, 0, 0]} name="flood_risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">Model-estimated risk scores — not official IMD forecasts. Data freshness: {meteo?.data_timestamp ?? "recent"}</p>
            </div>
          )}

          {/* ── Historical Timeline ─── */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Historical Disaster Timeline — {loc?.name}</h3>
              <div className="flex items-center gap-1.5 text-xs">
                {["all", "floods", "landslides", "land_risks"].map((f) => (
                  <button key={f} onClick={() => setHistoryFilter(f)}
                    className={`px-2.5 py-1 rounded-lg border font-bold transition ${historyFilter === f ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                    {f === "all" ? "All" : f === "floods" ? "Floods" : f === "landslides" ? "Landslides" : "Other"}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                Historical data unavailable for this parameter. Showing model-estimated risk only.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {filteredHistory.map((ev, i) => {
                    const typeIcon = ev.event_type?.toLowerCase().includes("flood") ? "🌊" : ev.event_type?.toLowerCase().includes("land") ? "⛰️" : "⚡";
                    return (
                      <div key={i} className="flex items-start gap-4 pl-10 relative">
                        <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center text-[10px]">{typeIcon}</div>
                        <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900">{ev.year ?? ev.event_date?.slice(0, 4)} — {ev.event_type ?? "Disaster Event"}</span>
                            {ev.severity && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${ev.severity === "Critical" || ev.severity === "Severe" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                {ev.severity}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{ev.description ?? ev.notes ?? `${ev.trigger_cause ?? "Rainfall-triggered"} event in ${ev.district ?? loc?.name}, ${ev.state ?? loc?.state}.`}</p>
                          {ev.casualties > 0 && <span className="text-red-600 font-bold text-[10px] mt-1 block">Reported casualties: {ev.casualties}</span>}
                          {ev.source && <span className="text-slate-400 text-[10px] block mt-0.5">Source: {ev.source}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Exposure & Vulnerable Assets ─── */}
          {exposure && Object.keys(exposure).length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-rose-700" />
                <h3 className="text-sm font-black text-slate-900">Estimated Potentially Exposed Assets</h3>
                <span className="ml-auto text-[10px] text-slate-400 font-medium italic">Model estimates — not confirmed figures</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { icon: Users, label: "Population", val: exposure.population_in_hazard_zone?.toLocaleString("en-IN"), color: "text-rose-700", bg: "bg-rose-50" },
                  { icon: Milestone, label: "Road Segments", val: exposure.road_segments_km ? `${exposure.road_segments_km} km` : "--", color: "text-orange-700", bg: "bg-orange-50" },
                  { icon: GraduationCap, label: "Schools", val: exposure.schools, color: "text-blue-700", bg: "bg-blue-50" },
                  { icon: HeartPulse, label: "Hospitals", val: exposure.hospitals, color: "text-red-700", bg: "bg-red-50" },
                  { icon: Building2, label: "Villages", val: exposure.villages, color: "text-amber-700", bg: "bg-amber-50" },
                  { icon: Milestone, label: "Bridges", val: exposure.bridges, color: "text-purple-700", bg: "bg-purple-50" },
                ].filter((a) => a.val && a.val !== "--" && a.val !== "undefined").map((a) => (
                  <div key={a.label} className={`p-3 rounded-xl border ${a.bg} border-current/10`}>
                    <a.icon className={`w-4 h-4 ${a.color} mb-1`} />
                    <span className="text-[10px] text-slate-500 font-bold block">{a.label}</span>
                    <span className={`font-black text-sm ${a.color}`}>{a.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── What-If Simulator (collapsible) ─── */}
          {showSimulator && (
            <WhatIfSimulator locationData={result} />
          )}
        </>
      )}

      {/* AI Report Modal */}
      {showReport && result && (
        <AIDisasterReportModal
          locationData={result}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Chat Assistant */}
      {result && <AIChatAssistant locationData={result} />}
    </div>
  );
}
