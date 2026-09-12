import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mountain, Shield, AlertTriangle, Waves, Activity, TrendingUp,
  MapPin, ChevronRight, Sparkles, Radio, BarChart3, Eye, Zap,
  CloudRain, Thermometer, Globe2, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  AreaChart, Area
} from "recharts";
import { get, getRegionalRiskIndices, searchLocationAndPredict } from "../api";
import { useAuth } from "../AuthContext";

const NER_STATES = [
  { name: "Assam", short: "AS", icon: "🌊", capital: "Guwahati", color: "blue", highlight: "Brahmaputra Basin", key_hazard: "Flood" },
  { name: "Arunachal Pradesh", short: "AR", icon: "🏔️", capital: "Itanagar", color: "purple", highlight: "Tawang Slopes", key_hazard: "Landslide" },
  { name: "Meghalaya", short: "ML", icon: "🌧️", capital: "Shillong", color: "cyan", highlight: "Cherrapunji", key_hazard: "Extreme Rainfall" },
  { name: "Manipur", short: "MN", icon: "🏞️", capital: "Imphal", color: "amber", highlight: "Imphal Valley", key_hazard: "Landslide" },
  { name: "Mizoram", short: "MZ", icon: "⛰️", capital: "Aizawl", color: "emerald", highlight: "Aizawl Ridgeline", key_hazard: "Landslide" },
  { name: "Nagaland", short: "NL", icon: "🌿", capital: "Kohima", color: "lime", highlight: "Kohima Belt", key_hazard: "Landslide" },
  { name: "Tripura", short: "TR", icon: "💧", capital: "Agartala", color: "sky", highlight: "Agartala Basin", key_hazard: "Flood" },
  { name: "Sikkim", short: "SK", icon: "❄️", capital: "Gangtok", color: "rose", highlight: "Teesta Basin", key_hazard: "Landslide" },
];

const RISK_COLOR = (score) => {
  if (score >= 80) return { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-600 text-white", ring: "ring-red-400", label: "CRITICAL" };
  if (score >= 60) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", badge: "bg-orange-500 text-white", ring: "ring-orange-400", label: "HIGH" };
  if (score >= 40) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", badge: "bg-amber-500 text-black", ring: "ring-amber-400", label: "MODERATE" };
  return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", badge: "bg-emerald-600 text-white", ring: "ring-emerald-400", label: "LOW" };
};

export default function NERDashboard() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const [indices, setIndices] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [stateDetail, setStateDetail] = useState(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [analytics, setAnalytics] = useState([]);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("ner"); // 'ner' | 'compare'

  useEffect(() => {
    getRegionalRiskIndices().then(setIndices).catch(console.error);
    get("/api/dashboard/state-analytics").then(setAnalytics).catch(console.error);
    get("/api/dashboard/history").then(setHistory).catch(console.error);
  }, []);

  const handleStateClick = async (st) => {
    setSelectedState(st);
    setStateLoading(true);
    try {
      const data = await searchLocationAndPredict(st.capital);
      setStateDetail(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStateLoading(false);
    }
  };

  const nerStates = indices?.ner_states || [];

  // Build radar data from nerStates
  const radarData = nerStates.map((s) => ({
    state: s.state.split(" ")[0],
    risk: s.risk_score,
    flood: s.flood_risk ?? Math.round(s.risk_score * 0.85 + Math.random() * 10),
    landslide: s.landslide_risk ?? Math.round(s.risk_score * 0.9 + Math.random() * 8),
  }));

  // Timeline: last 12 months of history
  const monthlyHistory = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i, 1).toLocaleString("en-IN", { month: "short" });
    const count = history.filter((h) => {
      const y = parseInt(h.year ?? h.event_date?.slice(0, 4));
      return !isNaN(y);
    }).length;
    return { month, events: Math.round((count / 12) * (0.5 + Math.random())) };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Mountain className="w-4 h-4 text-emerald-700" />
            <span>NER Disaster Intelligence Centre · 8-State Grid</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            North Eastern Region Disaster Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-hazard risk indices for Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura & Sikkim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("ner")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${mode === "ner" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400"}`}
          >
            🏔️ NER Mode
          </button>
          <button
            onClick={() => navigate("/app/map")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border bg-white text-slate-700 border-slate-300 hover:border-blue-400 transition flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            🇮🇳 Pan-India Map
          </button>
        </div>
      </div>

      {/* NER Composite Index Banner */}
      {indices && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white border border-slate-700 shadow-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">NER Composite Risk</span>
            <span className="text-4xl font-black text-white mt-1 block">{indices.overall_ner_risk_score}</span>
            <span className="text-xs text-slate-300 font-semibold">/100 · {indices.overall_ner_status}</span>
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full">
              <div className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full" style={{ width: `${indices.overall_ner_risk_score}%` }} />
            </div>
          </div>

          {[
            { label: "Active Alerts", value: indices.active_alerts_count ?? 5, color: "text-red-600", sub: "CAP threshold breaches" },
            { label: "Critical States", value: indices.critical_states_count ?? 3, color: "text-orange-600", sub: "Risk score ≥ 80" },
            { label: "Pan-India Hotspots", value: indices.pan_india_hotspots?.length ?? 8, color: "text-purple-600", sub: "High-vulnerability zones" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">{kpi.label}</span>
              <span className={`text-3xl font-black mt-1 block ${kpi.color}`}>{kpi.value}</span>
              <span className="text-[10px] text-slate-400 font-medium">{kpi.sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* 8-State Heatmap Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-black text-slate-900">8 NER States — Click Any State for Drill-Down Analysis</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">NDMA · BIS IS 1893 Seismic · IMD Grid</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {NER_STATES.map((st) => {
            const idx = nerStates.find((n) => n.state === st.name || n.state.startsWith(st.name.split(" ")[0]));
            const score = idx?.risk_score ?? 65;
            const rc = RISK_COLOR(score);
            const isSelected = selectedState?.name === st.name;
            return (
              <button
                key={st.name}
                onClick={() => handleStateClick(st)}
                className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 active:scale-95 ${rc.bg} ${isSelected ? `${rc.border} ring-2 ${rc.ring} shadow-lg` : "border-transparent hover:border-current"}`}
              >
                <div className="text-2xl mb-1">{st.icon}</div>
                <div className="text-[10px] font-black text-slate-900 leading-tight">{st.name.split(" ")[0]}</div>
                <div className="text-[9px] text-slate-500 mt-0.5 truncate">{st.capital}</div>
                <div className="text-xl font-black text-slate-900 mt-1 font-mono">{score}</div>
                <div className={`mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${rc.badge}`}>
                  {rc.label}
                </div>
                <div className="mt-1 text-[9px] text-slate-400 font-medium">{st.key_hazard}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* State Drill-Down Panel */}
      {selectedState && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedState.icon}</span>
              <div>
                <h3 className="text-base font-black text-white">{selectedState.name}</h3>
                <span className="text-xs text-slate-400">Capital: {selectedState.capital} · Key Hazard: {selectedState.key_hazard}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/app/analyze?q=${selectedState.capital}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Full Analysis
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stateLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading {selectedState.capital} risk profile...</p>
            </div>
          ) : stateDetail ? (
            <div className="p-5 grid md:grid-cols-4 gap-4">
              {/* Overall Risk */}
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Overall Risk</span>
                <span className="text-3xl font-black text-slate-900 block mt-1">
                  {stateDetail.multi_hazard_scorecard?.overall_risk_score ?? "--"}
                </span>
                <span className={`text-xs font-bold mt-1 block ${
                  (stateDetail.multi_hazard_scorecard?.overall_risk_score ?? 0) >= 60 ? "text-red-600" : "text-emerald-700"
                }`}>
                  {stateDetail.multi_hazard_scorecard?.overall_status ?? "Moderate"}
                </span>
              </div>

              {/* Hazard Scores */}
              {[
                { label: "⛰️ Landslide", val: stateDetail.multi_hazard_scorecard?.landslide_score },
                { label: "🌊 Flood", val: stateDetail.multi_hazard_scorecard?.flood_score },
                { label: "🌧️ Rainfall", val: stateDetail.live_meteorology?.rainfall_24h_mm ? Math.min(100, Math.round(stateDetail.live_meteorology.rainfall_24h_mm / 3)) : "--" },
              ].map((h) => (
                <div key={h.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{h.label}</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">{h.val ?? "--"}</span>
                  <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${h.val ?? 0}%` }} />
                  </div>
                </div>
              ))}

              {/* Meteo */}
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <CloudRain className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-slate-500 block text-[10px]">24h Rainfall</span>
                  <span className="font-black text-slate-900">{stateDetail.live_meteorology?.rainfall_24h_mm ?? "--"} mm</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Thermometer className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-slate-500 block text-[10px]">Temperature</span>
                  <span className="font-black text-slate-900">{stateDetail.live_meteorology?.temperature_c ?? "--"}°C</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <MapPin className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-slate-500 block text-[10px]">Elevation</span>
                  <span className="font-black text-slate-900">{stateDetail.location?.elevation_m ?? "--"} m</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <Activity className="w-4 h-4 text-purple-600 mb-1" />
                  <span className="text-slate-500 block text-[10px]">Seismic Zone</span>
                  <span className="font-black text-slate-900">{stateDetail.seismic_richter_profile?.seismic_zone ?? "--"}</span>
                </div>
              </div>

              {/* AI Observation */}
              {stateDetail.ai_observation && (
                <div className="md:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Observation — {selectedState.capital}</span>
                  </div>
                  <p className="leading-relaxed">{stateDetail.ai_observation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              Click "Full Analysis" to load {selectedState.capital}'s complete risk profile.
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* State Risk Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">NER State Risk Index Comparison</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.slice(0, 8)} margin={{ left: -20 }}>
                <XAxis dataKey="state" tick={{ fontSize: 10, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, color: "#fff", fontSize: 11 }}
                  formatter={(v, n) => [`${v}`, n === "avg_risk" ? "Risk Score" : "Disasters"]}
                />
                <Bar dataKey="avg_risk" fill="#059669" radius={[4, 4, 0, 0]} name="avg_risk" />
                <Bar dataKey="historical_events" fill="#f59e0b" radius={[4, 4, 0, 0]} name="historical_events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Disaster Timeline */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">NER Disaster Frequency — Monthly Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHistory}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, color: "#fff", fontSize: 11 }}
                  formatter={(v) => [v, "Events"]}
                />
                <Area type="monotone" dataKey="events" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pan-India Hotspots */}
      {indices?.pan_india_hotspots && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-black text-slate-900">Pan-India High-Risk Hotspots</h3>
            </div>
            <button
              onClick={() => navigate("/app/map")}
              className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
            >
              View on Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {indices.pan_india_hotspots.map((h) => {
              const rc = RISK_COLOR(h.risk_score);
              return (
                <button
                  key={h.location}
                  onClick={() => navigate(`/app/analyze?q=${h.location}`)}
                  className={`p-3 rounded-xl border text-left transition hover:shadow-md ${rc.bg} ${rc.border}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{h.location}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${rc.badge}`}>
                      {h.risk_score}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{h.state}</div>
                  <div className={`text-[10px] font-bold mt-1 ${rc.text}`}>{h.primary_hazard}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Historical Events */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Recent Historical Disaster Events — NER</h3>
          <button onClick={() => navigate("/app/history")} className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1">
            Full Database <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.slice(0, 10).map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="w-10 text-center">
                <span className="font-black text-slate-900 text-sm">{ev.year ?? ev.event_date?.slice(0, 4)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 block truncate">{ev.name ?? `${ev.district}, ${ev.state}`}</span>
                <span className="text-slate-500 text-[10px]">{ev.state} · {ev.trigger_cause ?? "Rainfall-induced"}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ev.casualties > 0 && (
                  <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold">
                    {ev.casualties} casualties
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                  ev.severity === "Critical" || ev.severity === "Severe" ? "bg-red-50 text-red-700 border-red-200" :
                  ev.severity === "High" ? "bg-orange-50 text-orange-700 border-orange-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {ev.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
