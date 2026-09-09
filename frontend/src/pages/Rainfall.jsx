import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CloudRain, AlertTriangle, Save, CheckCircle2 } from "lucide-react";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

export default function Rainfall() {
  const { t } = useAuth();
  const [locs, setLocs] = useState([]);
  const [id, setId] = useState(null);
  const [series, setSeries] = useState([]);
  const [thr, setThr] = useState(120);
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    get("/api/dashboard/locations").then((r) => {
      setLocs(r);
      setId(r[0]?.id);
    }).catch(console.error);
    get("/api/admin/settings").then((s) => {
      setSettings(s);
      setThr(s.rainfall_24h_threshold_mm);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (id) get(`/api/rainfall/series?location_id=${id}&hours=168`).then(setSeries).catch(console.error);
  }, [id]);

  const save = () =>
    post("/api/admin/settings", { rainfall_24h_threshold_mm: Number(thr) }).then((s) => {
      setSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });

  const last = series[series.length - 1];
  const breach = last && last.cumulative_24h_mm >= thr;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <CloudRain className="w-4 h-4 text-blue-700" />
            <span>IMD Precipitation & Hydro-Meteorology Network</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.rainfall}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly hyetograph telemetry, 24-hour cumulative thresholds, and antecedent saturation tracking.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Station:</span>
          <select
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={id || ""}
            onChange={(e) => setId(e.target.value)}
          >
            {locs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.state})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
            <span>24h Threshold:</span>
            <strong className="text-blue-800 font-bold">{thr} mm</strong>
            <input
              type="range"
              min="40"
              max="250"
              value={thr}
              onChange={(e) => setThr(e.target.value)}
              className="w-28 accent-blue-700"
            />
          </label>

          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saved ? "Saved!" : "Update Threshold"}</span>
          </button>
        </div>

        {breach && (
          <div className="w-full text-xs font-bold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>CRITICAL BREACH: 24h rainfall exceeded configured safety limit ({thr}mm). Geotechnical trigger armed.</span>
          </div>
        )}
      </div>

      {/* Hyetograph Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">7-Day Rainfall Hyetograph & Cumulative Inflow</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
              Hourly Rainfall (mm)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
              24h Cumulative (mm)
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
              />
              <Area dataKey="hourly_mm" stroke="#0284c7" fill="#0284c722" name="Hourly mm" />
              <Area dataKey="cumulative_24h_mm" stroke="#d97706" fill="#d9770622" name="24h cumulative mm" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
