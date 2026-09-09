import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SlidersHorizontal, BarChart3, TrendingUp } from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";

export default function Analytics() {
  const { t } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get("/api/dashboard/state-analytics").then(setRows).catch(console.error);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <span>State-Level Vulnerability Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.stateAnalytics}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative analysis of landslide and flood susceptibility across all 8 North Eastern states.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">State Risk Index & Historical Incident Frequency</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs" />
              Average Risk Score (0-100)
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs" />
              Recorded Disaster Events
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ bottom: 20 }}>
              <XAxis dataKey="state" tick={{ fontSize: 11, fill: "#475569" }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
              />
              <Bar dataKey="avg_risk" fill="#047857" name="Avg Risk (0-100)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="historical_events" fill="#d97706" name="Historical Disasters" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">State</th>
                <th className="px-3 text-center">Stations</th>
                <th className="px-3 text-center">Avg Risk</th>
                <th className="px-3 text-center">Peak Risk</th>
                <th className="px-3 text-center">Emergency Sites</th>
                <th className="px-3 text-right">Historical Disasters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rows.map((r) => (
                <tr key={r.state} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.state}</td>
                  <td className="px-3 text-center font-mono font-semibold">{r.stations}</td>
                  <td className="px-3 text-center font-mono font-bold text-slate-900">{r.avg_risk}</td>
                  <td className="px-3 text-center font-mono font-bold text-red-600">{r.max_risk}</td>
                  <td className="px-3 text-center">
                    <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {r.emergency_sites}
                    </span>
                  </td>
                  <td className="px-3 text-right font-mono font-semibold">{r.historical_events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
