import { useEffect, useState } from "react";
import { Radio, BatteryCharging, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";

export default function Sensors() {
  const { t } = useAuth();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => {
    get("/api/sensors/").then(setList).catch(console.error);
  };

  useEffect(() => {
    load();
    window.addEventListener("ner-sim-tick", load);
    return () => window.removeEventListener("ner-sim-tick", load);
  }, []);

  const filtered = list.filter((s) => (filter === "all" ? true : s.status === filter));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Radio className="w-4 h-4 text-emerald-700" />
            <span>Telemetry Hardware Monitoring</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.sensors}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inclinometers, vibrating-wire piezometers, and automated tipping-bucket telemetry nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="all">All Sensor Nodes ({list.length})</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline / Degraded</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{s.sensor_code}</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {s.sensor_type}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  s.status === "online" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {s.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold text-slate-800">{s.location_name || "Regional Station"}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-slate-700">{s.latitude.toFixed(3)}°N, {s.longitude.toFixed(3)}°E</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Battery Level:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  {s.battery_pct}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
              <span>Last Calibration: {s.last_calibrated || "2026-03-12"}</span>
              <span>LoraWAN / 4G</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
