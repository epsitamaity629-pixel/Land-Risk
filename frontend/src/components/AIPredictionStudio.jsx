import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Sliders,
  AlertTriangle,
  Award,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Layers,
  Sparkles
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { api } from "../services/api";

export default function AIPredictionStudio() {
  const [params, setParams] = useState({
    rainfall_intensity: 32.0,
    cumulative_24h_rainfall: 145.0,
    rainfall_duration_hrs: 24.0,
    soil_moisture: 82.0,
    slope_angle: 46.0,
    elevation: 1650.0,
    ground_displacement_rate: 9.5,
    pore_water_pressure_kpa: 68.0,
    temperature: 20.0,
    humidity: 92.0,
    distance_to_river: 280.0,
    historical_incidents_count: 5
  });

  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load initial prediction & model comparison benchmarks
  useEffect(() => {
    runPrediction();
    api.getMLMetrics().then(setMetrics).catch(console.error);
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await api.predictRisk(params);
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({
      rainfall_intensity: 15.0,
      cumulative_24h_rainfall: 45.0,
      rainfall_duration_hrs: 10.0,
      soil_moisture: 48.0,
      slope_angle: 32.0,
      elevation: 900.0,
      ground_displacement_rate: 2.1,
      pore_water_pressure_kpa: 22.0,
      temperature: 24.0,
      humidity: 65.0,
      distance_to_river: 800.0,
      historical_incidents_count: 1
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0 flex items-center gap-2">
              AI/ML Landslide Susceptibility & Prediction Studio
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Production Benchmark Suite
              </span>
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Simulate multivariate geotechnical triggers, compute real-time dynamic risk scores (0-100), and inspect factor attributions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Baseline
          </button>
          <button
            onClick={runPrediction}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {loading ? "Computing Inference..." : "Calculate AI Prediction"}
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Dynamic Risk Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Parameter Sliders */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-sky-400" />
              Geotechnical & Hydrometeorological Inputs
            </span>
            <span className="text-[11px] text-slate-400">
              Infinite Slope & Mohr-Coulomb Calibration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Cumulative 24h Rainfall */}
            <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Cumulative 24h Rainfall:</span>
                <span className="font-mono text-sky-400 font-bold">
                  {params.cumulative_24h_rainfall} mm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                step="5"
                value={params.cumulative_24h_rainfall}
                onChange={(e) =>
                  setParams({ ...params, cumulative_24h_rainfall: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] text-slate-400 block">IMD Alert Threshold: &gt;120mm</span>
            </div>

            {/* Rainfall Intensity */}
            <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Rainfall Intensity:</span>
                <span className="font-mono text-sky-400 font-bold">
                  {params.rainfall_intensity} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={params.rainfall_intensity}
                onChange={(e) =>
                  setParams({ ...params, rainfall_intensity: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] text-slate-400 block">Cloudburst Level: &gt;30 mm/hr</span>
            </div>

            {/* Slope Angle */}
            <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Slope Angle:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {params.slope_angle}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="1"
                value={params.slope_angle}
                onChange={(e) =>
                  setParams({ ...params, slope_angle: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-400 block">Critical Failure Plane: &gt;38°</span>
            </div>

            {/* Ground Displacement Rate */}
            <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Inclinometer Displacement:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {params.ground_displacement_rate} mm/day
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={params.ground_displacement_rate}
                onChange={(e) =>
                  setParams({ ...params, ground_displacement_rate: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[10px] text-slate-400 block">Immediate Shear Warning: &gt;10 mm/day</span>
            </div>

            {/* Soil Moisture */}
            <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Soil Moisture Saturation:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {params.soil_moisture}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={params.soil_moisture}
                onChange={(e) =>
                  setParams({ ...params, soil_moisture: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block">Liquefaction threshold: &gt;80%</span>
            </div>

            {/* Pore Water Pressure */}
            <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Piezometer Pore Pressure:</span>
                <span className="font-mono text-purple-400 font-bold">
                  {params.pore_water_pressure_kpa} kPa
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="2"
                value={params.pore_water_pressure_kpa}
                onChange={(e) =>
                  setParams({ ...params, pore_water_pressure_kpa: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-[10px] text-slate-400 block">Hydrostatic Overpressure: &gt;60 kPa</span>
            </div>
          </div>
        </div>

        {/* Right Col: AI Inference Result & Explainability */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Predicted Risk & Dynamic Landslide Score
            </h3>

            {prediction ? (
              <div className="mt-4 space-y-4">
                {/* Dial / Big Number Card */}
                <div
                  className={`p-4 rounded-xl border text-center ${
                    prediction.risk_level === "CRITICAL"
                      ? "bg-rose-950/40 border-rose-500/50"
                      : prediction.risk_level === "HIGH"
                      ? "bg-amber-950/40 border-amber-500/50"
                      : "bg-emerald-950/40 border-emerald-500/50"
                  }`}
                >
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-300 block">
                    DYNAMIC RISK SCORE
                  </span>
                  <div className="text-4xl font-black text-white mt-1">
                    {prediction.risk_score}
                    <span className="text-sm font-normal text-slate-400"> / 100</span>
                  </div>
                  <span
                    className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-extrabold tracking-wider ${
                      prediction.risk_level === "CRITICAL"
                        ? "bg-rose-500 text-white animate-pulse"
                        : prediction.risk_level === "HIGH"
                        ? "bg-amber-500 text-black"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {prediction.risk_level} RISK
                  </span>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                    <span>Landslide Probability:</span>
                    <strong className="text-rose-400 text-sm font-mono">
                      {prediction.landslide_probability}%
                    </strong>
                  </div>
                </div>

                {/* AI Explainability: Contributing Factors Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      Why is this area at risk? (Explainability)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {prediction.contributing_factors.map((cf, idx) => (
                      <div key={idx} className="space-y-0.5 text-xs">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>{cf.factor}</span>
                          <span className="font-mono font-bold text-sky-400">{cf.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{ width: `${cf.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision Support & Recommended Action */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <strong className="text-slate-300 block mb-1">Recommended Decision Support:</strong>
                  <p className="text-[11px] text-slate-400 m-0 leading-relaxed">
                    {prediction.recommended_action}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                Click "Calculate AI Prediction" to run inference.
              </div>
            )}
          </div>

          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Important Safety Principle:</strong> AI predictions are decision-support estimates and not guaranteed outcomes. Always verify critical alerts with official Geological Survey of India (GSI) authorities.
            </span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Leaderboard */}
      {metrics && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                Comparative ML Algorithm Leaderboard & Evaluation
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating Random Forest, Gradient Boosting, Extra Trees, and Logistic Regression on NER geotechnical test splits.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Active Deployment: {metrics.best_model}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">Algorithm</th>
                  <th className="pb-2.5 font-semibold">Accuracy</th>
                  <th className="pb-2.5 font-semibold">Precision</th>
                  <th className="pb-2.5 font-semibold">Recall</th>
                  <th className="pb-2.5 font-semibold">F1-Score</th>
                  <th className="pb-2.5 font-semibold">ROC-AUC</th>
                  <th className="pb-2.5 font-semibold">Deployment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.leaderboard.map((m, idx) => (
                  <tr
                    key={idx}
                    className={m.is_best ? "bg-emerald-500/5 text-white font-medium" : "text-slate-300"}
                  >
                    <td className="py-2.5 flex items-center gap-2 font-semibold">
                      {m.model_name}
                      {m.is_best && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-black font-bold">
                          BEST
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 font-mono">{m.accuracy}%</td>
                    <td className="py-2.5 font-mono">{m.precision}%</td>
                    <td className="py-2.5 font-mono">{m.recall}%</td>
                    <td className="py-2.5 font-mono font-bold text-sky-400">{m.f1_score}%</td>
                    <td className="py-2.5 font-mono">{m.roc_auc}</td>
                    <td className="py-2.5">
                      {m.is_best ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          ● Deployed in Inference Pipeline
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Benchmarked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
