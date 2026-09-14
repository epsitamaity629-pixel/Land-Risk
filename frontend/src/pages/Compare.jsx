import React, { useState, useEffect } from "react";
import {
  Scale,
  Sparkles,
  Search,
  ArrowRight,
  ShieldAlert,
  Mountain,
  Droplets,
  Activity,
  History,
  AlertTriangle,
  CheckCircle2,
  Compass,
  ArrowLeftRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { compareLocations } from "../api";
import { useAuth } from "../AuthContext";

export default function Compare() {
  const { t } = useAuth();
  const [locA, setLocA] = useState("Shillong");
  const [locB, setLocB] = useState("Gangtok");
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(false);

  const POPULAR_PAIRS = [
    { a: "Shillong", b: "Gangtok", label: "Shillong vs Gangtok (NER Hill Capitals)" },
    { a: "Darjeeling", b: "Siliguri", label: "Darjeeling vs Siliguri (Hill vs Foothills)" },
    { a: "Kedarnath", b: "Joshimath", label: "Kedarnath vs Joshimath (High Himalayas)" },
    { a: "Wayanad", b: "Munnar", label: "Wayanad vs Munnar (Western Ghats)" },
    { a: "Guwahati", b: "Itanagar", label: "Guwahati vs Itanagar (Assam vs Arunachal)" },
  ];

  useEffect(() => {
    handleCompare(locA, locB);
  }, []);

  const handleCompare = async (a = locA, b = locB) => {
    if (!a.trim() || !b.trim()) return;
    setLoading(true);
    try {
      const res = await compareLocations(a, b);
      setCompData(res);
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setLoading(false);
    }
  };

  const aData = compData?.location_a || {};
  const bData = compData?.location_b || {};
  const metrics = compData?.comparison_metrics || {};
  const verdict = compData?.verdict || {};

  const aName = aData.location?.name || locA;
  const bName = bData.location?.name || locB;

  // Prepare Radar Chart Data
  const radarData = [
    { subject: "Overall Risk", A: metrics.overall_risk?.a || 0, B: metrics.overall_risk?.b || 0, fullMark: 100 },
    { subject: "Landslide", A: metrics.landslide_risk?.a || 0, B: metrics.landslide_risk?.b || 0, fullMark: 100 },
    { subject: "Flood Risk", A: metrics.flood_risk?.a || 0, B: metrics.flood_risk?.b || 0, fullMark: 100 },
    { subject: "Rainfall (mm)", A: Math.min(100, metrics.rainfall_24h_mm?.a || 0), B: Math.min(100, metrics.rainfall_24h_mm?.b || 0), fullMark: 100 },
    { subject: "Slope (°)", A: Math.min(100, (metrics.slope_deg?.a || 0) * 1.8), B: Math.min(100, (metrics.slope_deg?.b || 0) * 1.8), fullMark: 100 },
    { subject: "History Events", A: Math.min(100, (metrics.historical_events?.a || 0) * 12), B: Math.min(100, (metrics.historical_events?.b || 0) * 12), fullMark: 100 },
  ];

  const barData = [
    { name: "Overall Risk", [aName]: metrics.overall_risk?.a || 0, [bName]: metrics.overall_risk?.b || 0 },
    { name: "Landslide", [aName]: metrics.landslide_risk?.a || 0, [bName]: metrics.landslide_risk?.b || 0 },
    { name: "Flood Risk", [aName]: metrics.flood_risk?.a || 0, [bName]: metrics.flood_risk?.b || 0 },
    { name: "24h Rain (mm)", [aName]: metrics.rainfall_24h_mm?.a || 0, [bName]: metrics.rainfall_24h_mm?.b || 0 },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Location Risk Comparison Engine
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Compare multi-hazard vulnerability, terrain steepness, seismic exposure, and historical disasters between any two locations across India.
          </p>
        </div>
      </div>

      {/* Comparison Input Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCompare();
          }}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
        >
          <div className="md:col-span-2 relative">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Location A (Primary)
            </span>
            <div className="relative">
              <MapPin className="w-4 h-4 text-purple-600 absolute left-3 top-2.5" />
              <input
                type="text"
                value={locA}
                onChange={(e) => setLocA(e.target.value)}
                placeholder="e.g. Shillong, Darjeeling, Mumbai..."
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-center text-slate-400 md:mt-4">
            <ArrowLeftRight className="w-5 h-5" />
          </div>

          <div className="md:col-span-2 relative">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Location B (Comparison Target)
            </span>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="text"
                value={locB}
                onChange={(e) => setLocB(e.target.value)}
                placeholder="e.g. Gangtok, Kedarnath, Siliguri..."
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="md:col-span-5 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold text-[10px] uppercase">Quick Pairs:</span>
              {POPULAR_PAIRS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setLocA(p.a);
                    setLocB(p.b);
                    handleCompare(p.a, p.b);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition border border-slate-200"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>{loading ? "Comparing..." : "Run AI Comparison"}</span>
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Fetching telemetry & calculating comparative multi-hazard indices...
          </p>
        </div>
      ) : compData ? (
        <div className="space-y-6">
          {/* AI Verdict Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Comparative Hazard Verdict</span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">{verdict.summary}</p>
          </div>

          {/* Side-by-Side Location Scorecards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location A Card */}
            <div className="p-6 rounded-2xl bg-white border-2 border-purple-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">
                    Location A
                  </span>
                  <h3 className="text-xl font-black text-slate-900">{aName}</h3>
                  <span className="text-xs text-slate-500">{aData.location?.state}, India</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-700">
                    {aData.multi_hazard_scorecard?.overall_risk_score}/100
                  </span>
                  <span className="text-[10px] font-bold block uppercase text-slate-600">
                    {aData.multi_hazard_scorecard?.overall_status} Risk Tier
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">⛰️ Landslide Score</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.landslide_risk?.a}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">🌊 Flood Score</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.flood_risk?.a}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">🌧️ 24h Rainfall</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.rainfall_24h_mm?.a} mm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">📐 Slope & Elevation</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.slope_deg?.a}° · ~{metrics.elevation_m?.a}m</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">🌋 Seismic Setting</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.seismic_zone?.a}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">📚 Cataloged Disasters</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.historical_events?.a} Events</span>
                </div>
              </div>
            </div>

            {/* Location B Card */}
            <div className="p-6 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Location B
                  </span>
                  <h3 className="text-xl font-black text-slate-900">{bName}</h3>
                  <span className="text-xs text-slate-500">{bData.location?.state}, India</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700">
                    {bData.multi_hazard_scorecard?.overall_risk_score}/100
                  </span>
                  <span className="text-[10px] font-bold block uppercase text-slate-600">
                    {bData.multi_hazard_scorecard?.overall_status} Risk Tier
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">⛰️ Landslide Score</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.landslide_risk?.b}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">🌊 Flood Score</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.flood_risk?.b}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">🌧️ 24h Rainfall</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.rainfall_24h_mm?.b} mm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">📐 Slope & Elevation</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.slope_deg?.b}° · ~{metrics.elevation_m?.b}m</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">🌋 Seismic Setting</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.seismic_zone?.b}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">📚 Cataloged Disasters</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{metrics.historical_events?.b} Events</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Comparison Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Multi-Dimensional Radar Comparison */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Multi-Hazard Multi-Dimensional Radar
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                    <Radar name={aName} dataKey="A" stroke="#7e22ce" fill="#a855f7" fillOpacity={0.4} />
                    <Radar name={bName} dataKey="B" stroke="#059669" fill="#10b981" fillOpacity={0.4} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metric Comparison Bar Chart */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Direct Metric Comparison
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, color: "#fff", fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey={aName} fill="#7e22ce" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={bName} fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
