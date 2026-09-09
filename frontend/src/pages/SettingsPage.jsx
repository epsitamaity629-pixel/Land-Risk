import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, CheckCircle2 } from "lucide-react";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

export default function SettingsPage() {
  const { t } = useAuth();
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    get("/api/admin/settings").then(setS).catch(console.error);
  }, []);

  if (!s) return null;

  const setParam = (k, v) => setS({ ...s, [k]: Number(v) });

  const handleSave = () => {
    post("/api/admin/settings", s).then((res) => {
      setS(res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const labels = {
    rainfall_24h_threshold_mm: "24h Cumulative Rainfall Warning Trigger (mm)",
    rainfall_7d_threshold_mm: "7-Day Cumulative Antecedent Saturation (mm)",
    displacement_threshold_mm: "Ground Inclinometer Displacement Alert (mm)",
    tilt_threshold_deg: "Slope Tilt Threshold Angle (°)",
    pore_pressure_threshold_kpa: "Pore-Water Pressure Safety Limit (kPa)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <SettingsIcon className="w-4 h-4 text-emerald-700" />
            <span>Automated Early Warning Threshold Calibration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.thresholds}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated alarm trigger cutoffs for IMD rainfall and IoT geotechnical sensors.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        {Object.entries(s).map(([k, v]) => (
          <div key={k} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>{labels[k] || k}</span>
              <span className="font-mono text-emerald-800 text-sm">{v}</span>
            </div>
            <input
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              type="number"
              step="any"
              value={v}
              onChange={(e) => setParam(k, e.target.value)}
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>

          {saved && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
