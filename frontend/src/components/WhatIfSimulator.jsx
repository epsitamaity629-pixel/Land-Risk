import React, { useState, useEffect } from "react";
import {
  Sliders,
  Sparkles,
  CloudRain,
  Droplets,
  Activity,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Zap
} from "lucide-react";
import { simulateScenario } from "../api";
import RiskGauge from "./RiskGauge";

export default function WhatIfSimulator({ locationData, onSimulationUpdate = null }) {
  const [rainfallDelta, setRainfallDelta] = useState(0);
  const [moistureDelta, setMoistureDelta] = useState(0);
  const [seismicBoost, setSeismicBoost] = useState(0);
  const [preset, setPreset] = useState("custom");
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const locName = locationData?.location?.name || "Shillong";
  const locState = locationData?.location?.state || "Meghalaya";

  useEffect(() => {
    runSimulation(rainfallDelta, moistureDelta, seismicBoost, preset);
  }, [locationData]);

  const runSimulation = async (rDelta, mDelta, sBoost, pset = "custom") => {
    if (!locationData) return;
    setLoading(true);
    try {
      const res = await simulateScenario({
        query: locName,
        location_data: locationData,
        rainfall_delta_pct: rDelta,
        soil_moisture_delta_pct: mDelta,
        seismic_shock_boost: sBoost,
        scenario_preset: pset,
      });
      setSimResult(res);
      if (onSimulationUpdate) onSimulationUpdate(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetName, rDelta, mDelta, sBoost) => {
    setPreset(presetName);
    setRainfallDelta(rDelta);
    setMoistureDelta(mDelta);
    setSeismicBoost(sBoost);
    runSimulation(rDelta, mDelta, sBoost, presetName);
  };

  const handleReset = () => {
    applyPreset("custom", 0, 0, 0);
  };

  const baseline = simResult?.baseline || {};
  const simulated = simResult?.simulated || {};
  const deltas = simResult?.deltas || {};

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                AI Disaster Scenario Simulator ("What If?" Engine)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                Interactive ML Recalculator
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Simulate extreme meteorological & seismic events for <span className="text-emerald-700 font-semibold">{locName}, {locState}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
          Preset Meteorological Scenarios:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset("custom", 0, 0, 0)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              rainfallDelta === 0 && moistureDelta === 0 && seismicBoost === 0
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            🟢 Normal / Baseline
          </button>
          <button
            onClick={() => applyPreset("heavy_monsoon", 50, 25, 0)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              preset === "heavy_monsoon"
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            🟡 Heavy Monsoon (+50%)
          </button>
          <button
            onClick={() => applyPreset("extreme_cloudburst", 150, 40, 0)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              preset === "extreme_cloudburst"
                ? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            🔴 Extreme Cloudburst (+150%)
          </button>
          <button
            onClick={() => applyPreset("earthquake_plus_monsoon", 60, 30, 0.25)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              preset === "earthquake_plus_monsoon"
                ? "bg-purple-50 border-purple-300 text-purple-900 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            🌋 Quake + Monsoon Shock
          </button>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        {/* Slider 1: Rainfall Delta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Rainfall Surge</span>
            </span>
            <span className="font-mono font-bold text-blue-700">
              {rainfallDelta > 0 ? `+${rainfallDelta}%` : `${rainfallDelta}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="200"
            step="5"
            value={rainfallDelta}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRainfallDelta(val);
              setPreset("custom");
              runSimulation(val, moistureDelta, seismicBoost, "custom");
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-50%</span>
            <span>0%</span>
            <span>+100%</span>
            <span>+200%</span>
          </div>
        </div>

        {/* Slider 2: Soil Moisture Delta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Droplets className="w-4 h-4 text-teal-600" />
              <span>Soil Saturation Shift</span>
            </span>
            <span className="font-mono font-bold text-teal-700">
              {moistureDelta > 0 ? `+${moistureDelta}%` : `${moistureDelta}%`}
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="60"
            step="5"
            value={moistureDelta}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMoistureDelta(val);
              setPreset("custom");
              runSimulation(rainfallDelta, val, seismicBoost, "custom");
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-30%</span>
            <span>0%</span>
            <span>+30%</span>
            <span>+60%</span>
          </div>
        </div>

        {/* Slider 3: Seismic Shock PGA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Seismic Motion Boost</span>
            </span>
            <span className="font-mono font-bold text-purple-700">
              +{seismicBoost}g PGA
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.05"
            value={seismicBoost}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSeismicBoost(val);
              setPreset("custom");
              runSimulation(rainfallDelta, moistureDelta, val, "custom");
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.0g</span>
            <span>0.1g</span>
            <span>0.2g</span>
            <span>0.4g</span>
          </div>
        </div>
      </div>

      {/* Recalculation Results: Baseline vs Simulated */}
      {simResult && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Landslide Delta Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                ⛰️ Landslide Hazard Score
              </span>
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">{baseline.landslide_score}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xl font-black text-slate-900">{simulated.landslide_score}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    deltas.landslide_delta > 0
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {deltas.landslide_delta > 0 ? `+${deltas.landslide_delta}` : `${deltas.landslide_delta}`} pts
                </span>
              </div>
            </div>

            {/* Flood Delta Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                🌊 Flood Inundation Score
              </span>
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">{baseline.flood_score}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xl font-black text-slate-900">{simulated.flood_score}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    deltas.flood_delta > 0
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {deltas.flood_delta > 0 ? `+${deltas.flood_delta}` : `${deltas.flood_delta}`} pts
                </span>
              </div>
            </div>

            {/* Overall Composite Delta Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                🛡️ Overall Multi-Hazard Risk
              </span>
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">{baseline.overall_risk_score}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xl font-black text-emerald-700">{simulated.overall_risk_score}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    deltas.overall_delta > 0
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {simulated.status}
                </span>
              </div>
            </div>
          </div>

          {/* AI Simulation Verdict */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed font-medium">{simResult.ai_simulation_verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}
