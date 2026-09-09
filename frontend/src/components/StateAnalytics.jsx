import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Layers,
  MapPin
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPie,
  Pie
} from "recharts";
import { api } from "../services/api";

export default function StateAnalytics() {
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    api.getStateAnalytics().then(setStateData).catch(console.error);
  }, []);

  const COLORS = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              State & District Vulnerability Analytics (NER)
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Cross-state comparison across the 8 North Eastern states for proactive disaster mitigation and resource allocation.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Average Risk Score Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-sky-400" />
            Composite Landslide Vulnerability Score by State
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <XAxis dataKey="state" stroke="#64748B" fontSize={10} interval={0} angle={-25} textAnchor="end" />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#1E293B",
                    borderRadius: "0.5rem",
                    color: "#F8FAFC",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="average_risk_score" name="Risk Score (0-100)" radius={[4, 4, 0, 0]}>
                  {stateData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.average_risk_score >= 75 ? "#EF4444" : entry.average_risk_score >= 50 ? "#F97316" : "#10B981"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24h Average Rainfall Comparison */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-cyan-400" />
            Average 24-Hour Rainfall Infiltration by State (mm)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <XAxis dataKey="state" stroke="#64748B" fontSize={10} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#1E293B",
                    borderRadius: "0.5rem",
                    color: "#F8FAFC",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="average_24h_rainfall_mm" name="24h Rainfall (mm)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* State Overview Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white">All 8 North Eastern Region States Matrix</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-semibold">State</th>
                <th className="pb-2.5 font-semibold">Monitoring Stations</th>
                <th className="pb-2.5 font-semibold">Composite Risk Score</th>
                <th className="pb-2.5 font-semibold">Risk Classification</th>
                <th className="pb-2.5 font-semibold">Active Alerts</th>
                <th className="pb-2.5 font-semibold">Historical Landslide Events</th>
                <th className="pb-2.5 font-semibold">Vulnerability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stateData.map((st, idx) => (
                <tr key={idx} className="text-slate-300">
                  <td className="py-2.5 font-bold text-white">{st.state}</td>
                  <td className="py-2.5 font-mono">{st.monitoring_stations} Stations</td>
                  <td className="py-2.5 font-mono font-bold text-sky-400">{st.average_risk_score} / 100</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.risk_level === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : st.risk_level === "HIGH"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {st.risk_level}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-rose-400 font-bold">{st.active_alerts}</td>
                  <td className="py-2.5 font-mono text-slate-400">{st.historical_incidents}</td>
                  <td className="py-2.5 font-mono text-slate-300">{st.vulnerability_index} / 10.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
