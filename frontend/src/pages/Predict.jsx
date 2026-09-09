import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Brain,
  Sliders,
  Sparkles,
  Mountain,
  Waves,
  Shield,
  RotateCcw,
  CheckCircle,
  Search,
  Activity,
  Layers
} from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import LocationRiskSearch from "../components/LocationRiskSearch";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

const DEFAULT_SIM = {
  slope_deg: 38,
  rainfall_24h_mm: 90,
  rainfall_7d_mm: 260,
  soil_moisture_pct: 62,
  pore_pressure_kpa: 28,
  elevation_m: 1200,
  lithology: "weathered_shale",
  displacement_mm: 4,
  tilt_deg: 1.4,
  distance_to_river_m: 1400,
  river_basin_elevation_diff_m: 15,
  drainage_density_km_km2: 2.8,
  catchment_rainfall_48h_mm: 180,
};

export default function Predict() {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'simulator'
  const [form, setForm] = useState(DEFAULT_SIM);
  const [liths, setLiths] = useState([]);
  const [out, setOut] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get("/api/ml/lithology").then(setLiths).catch(console.error);
    get("/api/ml/metrics").then(setMetrics).catch(console.error);
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await post("/api/predict/multi-hazard", form);
      setOut(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const setParam = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Brain className="w-4 h-4 text-emerald-700" />
            <span>AI/ML Predictive Analytics & Geotechnical Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Multi-Hazard AI Prediction & Model Benchmark Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate multivariate geotechnical triggers, hydrological catchment runoff, and inspect model explainability.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "search"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Live Place Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "simulator"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Live Location Search & Predictor */}
      {activeTab === "search" && (
        <div className="space-y-6 animate-fadeIn">
          <LocationRiskSearch />
        </div>
      )}

      {/* Mode 2: Interactive What-If Geotechnical Simulator */}
      {activeTab === "simulator" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid lg:grid-cols-12 gap-5">
            {/* Left Controls Form */}
            <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-sm font-bold text-slate-900">Geotechnical & Hydrological Trigger Parameters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm(DEFAULT_SIM);
                    runSimulation();
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {[
                  { k: "slope_deg", label: "Slope Angle (°)", min: 0, max: 65, step: 1 },
                  { k: "rainfall_24h_mm", label: "24h Rainfall (mm)", min: 0, max: 350, step: 5 },
                  { k: "rainfall_7d_mm", label: "7-Day Rain (mm)", min: 0, max: 800, step: 10 },
                  { k: "soil_moisture_pct", label: "Soil Moisture (%)", min: 10, max: 100, step: 1 },
                  { k: "pore_pressure_kpa", label: "Pore-Water Pressure (kPa)", min: 0, max: 90, step: 1 },
                  { k: "elevation_m", label: "Elevation (m AMSL)", min: 40, max: 4200, step: 50 },
                  { k: "displacement_mm", label: "Ground Displacement (mm)", min: 0, max: 30, step: 0.5 },
                  { k: "tilt_deg", label: "Inclinometer Tilt (°)", min: 0, max: 10, step: 0.1 },
                  { k: "distance_to_river_m", label: "Distance to River (m)", min: 100, max: 8000, step: 100 },
                  { k: "catchment_rainfall_48h_mm", label: "Upstream Catchment Rain (mm)", min: 0, max: 400, step: 10 },
                ].map(({ k, label, min, max, step }) => (
                  <div key={k} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                      <span>{label}</span>
                      <span className="font-mono text-emerald-800 font-bold">{form[k]}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={form[k]}
                      onChange={(e) => setParam(k, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                    />
                  </div>
                ))}
              </div>

              {/* Lithology Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Geological Formation (Lithology)
                </label>
                <select
                  value={form.lithology}
                  onChange={(e) => setParam("lithology", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {liths.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={runSimulation}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Recalculate Multi-Hazard Risk</span>
              </button>
            </div>

            {/* Right Output Results */}
            <div className="lg:col-span-6 space-y-4">
              {/* Dual Gauges */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Landslide Gauge */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-2">
                    <Mountain className="w-4 h-4 text-amber-700" />
                    <span>Landslide Risk Score</span>
                  </div>
                  <RiskGauge score={out?.landslide?.risk_score || 0} label={`p=${((out?.landslide?.probability || 0) * 100).toFixed(1)}%`} />
                  <span className={`mt-2 text-xs font-black px-3 py-0.5 rounded-full border ${
                    (out?.landslide?.risk_score || 0) >= 60 ? "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400" :
                    (out?.landslide?.risk_score || 0) < 40 ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-black" :
                    "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                  }`}>
                    {(out?.landslide?.risk_score || 0) >= 60 ? "🔴 DANGER (HIGH HAZARD)" :
                     (out?.landslide?.risk_score || 0) < 40 ? "🟢 DANGER FREE (SAFE)" :
                     "🟡 MODERATE (WATCH)"}
                  </span>
                </div>

                {/* Flood Gauge */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold mb-2">
                    <Waves className="w-4 h-4 text-blue-700" />
                    <span>Flood Inundation Score</span>
                  </div>
                  <RiskGauge score={out?.flood?.risk_score || 0} label={`p=${((out?.flood?.probability || 0) * 100).toFixed(1)}%`} />
                  <span className={`mt-2 text-xs font-black px-3 py-0.5 rounded-full border ${
                    (out?.flood?.risk_score || 0) >= 60 ? "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400" :
                    (out?.flood?.risk_score || 0) < 40 ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-black" :
                    "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                  }`}>
                    {(out?.flood?.risk_score || 0) >= 60 ? "🔴 DANGER (FLOOD INUNDATION)" :
                     (out?.flood?.risk_score || 0) < 40 ? "🟢 DANGER FREE (SAFE)" :
                     "🟡 MODERATE (WATCH)"}
                  </span>
                </div>
              </div>

              {/* Factor Attribution */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Factor Contributions (SHAP Attribution)
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={out?.landslide?.explainability || []} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="factor" stroke="#64748b" fontSize={10} width={130} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
                        formatter={(v) => [`${v}%`, "Contribution"]}
                      />
                      <Bar dataKey="contribution_pct" fill="#047857" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Benchmark Leaderboard */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Machine Learning Production Model Benchmark</h2>
            <p className="text-xs text-slate-500">Cross-validation on 3,000+ geotechnical and hydrological events</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Himalayan Training Dataset
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="px-3">Accuracy</th>
                <th className="px-3">Precision</th>
                <th className="px-3">Recall</th>
                <th className="px-3">F1-Score</th>
                <th className="px-3 text-right">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(metrics?.leaderboard || []).map((m, idx) => (
                <tr key={m.name} className={`hover:bg-slate-50 transition ${idx === 0 ? "bg-emerald-50/40 font-bold" : ""}`}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {m.name}
                    {idx === 0 && (
                      <span className="ml-2 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                        Production Best
                      </span>
                    )}
                  </td>
                  <td className="px-3 font-mono">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="px-3 font-mono">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="px-3 font-mono">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="px-3 font-mono">{m.f1.toFixed(3)}</td>
                  <td className="px-3 text-right font-mono font-bold text-slate-900">{m.roc_auc.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
