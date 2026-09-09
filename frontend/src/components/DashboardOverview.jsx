import React from "react";
import {
  AlertOctagon,
  TrendingUp,
  CloudRain,
  Radio,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  MapPin
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function DashboardOverview({
  overview,
  locations,
  onSelectLocation,
  setActiveTab
}) {
  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mr-3"></div>
        Loading live NER surveillance telemetry...
      </div>
    );
  }

  const getRiskBadge = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "MODERATE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const sampleHourlyRisk = [
    { hour: "06:00", score: 28 },
    { hour: "08:00", score: 35 },
    { hour: "10:00", score: 45 },
    { hour: "12:00", score: 62 },
    { hour: "14:00", score: 74 },
    { hour: "16:00", score: overview.ner_average_risk_score || 78 },
    { hour: "18:00 (Pred)", score: 82 },
    { hour: "20:00 (Pred)", score: 85 }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner if Active Alerts exist */}
      {overview.active_alerts_count > 0 && (
        <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-rose-950/40 border-l-4 border-rose-500 p-4 rounded-xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center animate-pulse">
              <AlertOctagon className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-400 tracking-wide text-sm">
                  ACTIVE CRITICAL ADVISORY ISSUED
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                  {overview.active_alerts_count} Active Alerts
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Torrential rain and high pore pressure detected along NH-10 (Sikkim) and Tupul Railway corridor (Manipur).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("alerts")}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1"
          >
            Review Warning Feed
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Risk Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">NER OVERALL RISK LEVEL</p>
              <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                {overview.ner_average_risk_score}
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border tracking-wider ${getRiskBadge(
                overview.ner_overall_risk_level
              )}`}
            >
              {overview.ner_overall_risk_level}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>AI Landslide Probability:</span>
            <span className="font-bold text-rose-400 text-sm">
              {overview.ner_average_probability}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overview.ner_average_risk_score >= 75
                  ? "bg-rose-500"
                  : overview.ner_average_risk_score >= 50
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${overview.ner_average_risk_score}%` }}
            ></div>
          </div>
        </div>

        {/* Monitored Locations Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">MONITORED REGIONAL PASSES</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {overview.monitored_locations_count}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-semibold">
              {overview.critical_risk_zones_count} Critical Zones
            </span>
            <span className="text-amber-400 font-semibold">
              {overview.high_risk_zones_count} High Risk
            </span>
          </div>
        </div>

        {/* Cumulative Rainfall Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">AVERAGE 24H RAINFALL</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {overview.rainfall_24h_avg_mm}{" "}
                <span className="text-sm font-normal text-slate-400">mm</span>
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CloudRain className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>7-Day Infiltration:</span>
            <span className="font-semibold text-cyan-300">
              {overview.rainfall_7d_avg_mm} mm
            </span>
          </div>
        </div>

        {/* IoT Sensor Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">IOT SENSOR MESH</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {overview.online_sensors_count}
                <span className="text-sm font-normal text-slate-400">
                  {" "}/ {overview.total_sensors_count} Online
                </span>
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Radio className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Avg Ground Velocity:</span>
            <span className="font-semibold text-amber-400">
              {overview.ground_movement_avg_mm} mm/day
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Quick Sector Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Timeline Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                NER Dynamic Landslide Risk Index (24h Timeline & Forecast)
              </h3>
              <p className="text-xs text-slate-400">
                Composite of ML probability, tiltmeter velocity, and rainfall threshold breach.
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Auto-updating
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleHourlyRisk}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#1E293B",
                    borderRadius: "0.5rem",
                    color: "#F8FAFC",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#riskGrad)"
                  name="Risk Score (0-100)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Sector Risk Ranking */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Critical Sectors</h3>
            <button
              onClick={() => setActiveTab("gis-map")}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              Open GIS Map <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
            {locations.slice(0, 6).map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc);
                  setActiveTab("gis-map");
                }}
                className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      {loc.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {loc.district}, {loc.state}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(
                      loc.risk_level
                    )}`}
                  >
                    {loc.risk_level}
                  </span>
                  <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                    {loc.risk_score}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
