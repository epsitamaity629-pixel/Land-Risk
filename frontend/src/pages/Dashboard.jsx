import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Shield,
  Activity,
  Droplets,
  Radio,
  AlertTriangle,
  Waves,
  Mountain,
  Users,
  Compass,
  FileText,
  Clock
} from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import LocationRiskSearch from "../components/LocationRiskSearch";
import { get } from "../api";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { t } = useAuth();
  const [sum, setSum] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [locs, setLocs] = useState([]);
  const [tl, setTl] = useState([]);
  const [rain, setRain] = useState([]);

  const load = () => {
    get("/api/dashboard/summary").then(setSum).catch(console.error);
    get("/api/alerts/").then(setAlerts).catch(console.error);
    get("/api/dashboard/locations").then(setLocs).catch(console.error);
    get("/api/dashboard/risk-timeline").then(setTl).catch(console.error);
    get("/api/rainfall/latest").then(setRain).catch(console.error);
  };

  useEffect(() => {
    load();
    const onTick = () => load();
    window.addEventListener("ner-sim-tick", onTick);
    return () => window.removeEventListener("ner-sim-tick", onTick);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.commandCenter}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-hazard telemetry, IMD radar feeds, and early warning grid for 8 NER states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Telemetry Grid Active</span>
          </div>
        </div>
      </div>

      {/* Universal Search and Predictor Widget */}
      <LocationRiskSearch />

      {/* 4-Tier Risk Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Composite Regional Gauge */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <RiskGauge score={sum?.avg_risk_score || 0} label="Regional Mean Risk" />
          <span className="text-[11px] font-semibold text-slate-500 mt-2">
            Average Score Across 32 Stations
          </span>
        </div>

        {/* 🟢 Low Risk */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
            <span>🟢 {t.lowRisk}</span>
            <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Safe Baseline</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{sum?.risk_levels?.Info ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Monitored sites normal</p>
        </div>

        {/* 🟡 Medium / Advisory */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
            <span>🟡 {t.mediumRisk}</span>
            <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Watch Phase</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{sum?.risk_levels?.Advisory ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Ground creep watch</p>
        </div>

        {/* 🟠 High / Warning */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-t-4 border-t-orange-500">
          <div className="flex items-center justify-between text-orange-700 text-xs font-bold">
            <span>🟠 {t.highRisk}</span>
            <span className="text-[10px] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">Alert Phase</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{sum?.risk_levels?.Warning ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Heavy rainfall breach</p>
        </div>

        {/* 🔴 Critical / Emergency */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-t-4 border-t-red-600">
          <div className="flex items-center justify-between text-red-700 text-xs font-bold">
            <span>🔴 {t.criticalRisk}</span>
            <span className="text-[10px] bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">Emergency EOC</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{sum?.risk_levels?.Emergency ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Imminent hazard response</p>
        </div>
      </div>

      {/* Charts & Alert Feeds */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Risk Timeline Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">24-Hour Multi-Hazard Risk Forecast Timeline</h2>
              <p className="text-xs text-slate-500">Continuous meteorological risk progression</p>
            </div>
            <span className="text-xs text-slate-500 font-semibold">IMD High-Res Grid</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tl}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v) => [`${v} / 100`, "Predicted Risk Score"]}
                />
                <Area dataKey="risk" stroke="#047857" fill="#10b98122" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alert Ticker */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h2 className="text-sm font-bold text-slate-900">Live Warning Ticker</h2>
              </div>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {alerts.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="text-xs p-2.5 rounded-lg border-l-4 border-l-orange-500 bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center justify-between font-bold text-orange-800">
                    <span>{a.level}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-Triggered</span>
                  </div>
                  <div className="text-slate-800 font-semibold mt-0.5">{a.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{a.message}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Automated SMS/CAP Broadcast Active</span>
            <span>Refreshed Live</span>
          </div>
        </div>
      </div>

      {/* Monitored Locations Table & Hardware Health */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Monitored Station Susceptibility Matrix</h2>
            <span className="text-xs text-slate-500 font-semibold">32 Geotechnical Stations</span>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Location & Corridor</th>
                  <th className="px-3">State</th>
                  <th className="px-3 text-right">Risk Score</th>
                  <th className="px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {locs.slice(0, 10).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {l.name}
                      {l.highway && (
                        <span className="ml-2 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {l.highway}
                        </span>
                      )}
                    </td>
                    <td className="px-3 text-slate-500">{l.state}</td>
                    <td className="px-3 text-right font-mono font-bold text-slate-900">{l.risk_score}</td>
                    <td className="px-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        l.risk_score >= 60 ? "bg-red-100 text-red-800 border border-red-300" :
                        l.risk_score < 40 ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-black" :
                        "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}>
                        {l.risk_score >= 60 ? "🔴 DANGER" : l.risk_score < 40 ? "🟢 DANGER FREE" : "🟡 MODERATE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Sensor Hardware & Rainfall Health
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-xs block font-medium">Regional 24h Average Rainfall</span>
                <span className="text-2xl font-bold text-blue-800 mt-1 block">{sum?.avg_rainfall_24h_mm} mm</span>
                <span className="text-[11px] text-slate-500">{rain.length} automated tipping-bucket stations reporting</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-xs block font-medium">IoT Sensor Network Status</span>
                <span className="text-xl font-bold text-emerald-700 mt-1 block">
                  {sum?.sensors_online} / {sum?.sensors_total} Online
                </span>
                <span className="text-[11px] text-slate-500">Inclinometers, Piezometers & Rain Gauges</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-slate-400 flex justify-between border-t border-slate-100">
            <span>Battery Health: 92% Nominal</span>
            <span>Solar Backup OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
