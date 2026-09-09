import React, { useState, useEffect } from "react";
import {
  CloudRain,
  Sliders,
  AlertTriangle,
  Droplets,
  TrendingUp,
  Clock,
  ShieldAlert
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
  ReferenceLine
} from "recharts";
import { api } from "../services/api";

export default function RainfallMonitoring() {
  const [stations, setStations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [warningThreshold, setWarningThreshold] = useState(25.0);
  const [criticalThreshold, setCriticalThreshold] = useState(45.0);

  useEffect(() => {
    api.getRainfallStations().then(setStations).catch(console.error);
    api.getRainfallTrends().then(setTrends).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Rainfall Header & Configurable Thresholds */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Hydro-Meteorological Rainfall Monitoring & Infiltration Tracking
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Live automated rain-gauge network, hourly precipitation velocity, and dynamic threshold breach warnings.
            </p>
          </div>
        </div>

        {/* Configurable Threshold Sliders */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Warning Threshold:</span>
              <span className="font-bold text-amber-400 font-mono">{warningThreshold} mm/h</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(parseFloat(e.target.value))}
              className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Critical Breach:</span>
              <span className="font-bold text-rose-400 font-mono">{criticalThreshold} mm/h</span>
            </div>
            <input
              type="range"
              min="30"
              max="70"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(parseFloat(e.target.value))}
              className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Hourly Rainfall Trend Curves Across Regional Centers */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              24-Hour Precipitation Curve vs Critical Alert Threshold
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized automated telemetry from Doppler radar and ground rain-gauges.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Gangtok
            </span>
            <span className="flex items-center gap-1 text-purple-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span> Cherrapunji
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> Threshold ({criticalThreshold} mm)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  borderColor: "#1E293B",
                  borderRadius: "0.5rem",
                  color: "#F8FAFC",
                  fontSize: "12px"
                }}
              />
              <ReferenceLine y={criticalThreshold} stroke="#EF4444" strokeDasharray="3 3" label="CRITICAL THRESHOLD" />
              <Area type="monotone" dataKey="Cherrapunji" stroke="#A855F7" fill="#A855F7" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="Gangtok" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="Aizawl" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Rain-Gauge Station Telemetry Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Droplets className="h-4 w-4 text-sky-400" />
          Automated Rain Gauge Stations (ARG) - Real-time Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-semibold">Station / Pass</th>
                <th className="pb-2.5 font-semibold">State</th>
                <th className="pb-2.5 font-semibold">Current Hourly</th>
                <th className="pb-2.5 font-semibold">24h Cumulative</th>
                <th className="pb-2.5 font-semibold">7-Day Total</th>
                <th className="pb-2.5 font-semibold">Intensity Class</th>
                <th className="pb-2.5 font-semibold">Safety Breach State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stations.map((st) => (
                <tr key={st.location_id} className="text-slate-300">
                  <td className="py-2.5 font-semibold text-white">{st.location_name}</td>
                  <td className="py-2.5 text-slate-400">{st.state}</td>
                  <td className="py-2.5 font-mono font-bold text-cyan-400">
                    {st.current_hourly_mm} mm/h
                  </td>
                  <td className="py-2.5 font-mono text-slate-200">{st.cumulative_24h_mm} mm</td>
                  <td className="py-2.5 font-mono text-slate-400">{st.cumulative_7d_mm} mm</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.intensity === "Torrential"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : st.intensity === "Heavy"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {st.intensity}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {st.current_hourly_mm >= criticalThreshold ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                        <ShieldAlert className="h-3.5 w-3.5" /> CRITICAL BREACH
                      </span>
                    ) : st.current_hourly_mm >= warningThreshold ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        ⚠️ WARNING LEVEL
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        ✓ NORMAL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
