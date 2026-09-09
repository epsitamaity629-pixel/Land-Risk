import React from "react";
import {
  ShieldAlert,
  Layers,
  BrainCircuit,
  CloudRain,
  Cpu,
  ArrowRight,
  MapPin,
  CheckCircle,
  Radio,
  Share2,
  Lock,
  Activity
} from "lucide-react";

export default function LandingPage({ onExploreDashboard, onExploreMap }) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-8 md:p-14 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wider uppercase animate-pulse">
          <Radio className="h-3.5 w-3.5" />
          Autonomous Landslide Early Warning Grid • North Eastern Region (NER)
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight m-0">
          AI-Powered Landslide Risk Monitoring & Early Warning System
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed m-0">
          Integrating artificial intelligence, IoT geotechnical sensors, satellite hydro-meteorology, and GIS spatial terrain intelligence across all 8 North Eastern States of India.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onExploreDashboard}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Activity className="h-4 w-4" />
            Launch Command Center Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onExploreMap}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Layers className="h-4 w-4 text-sky-400" />
            Open Interactive GIS Risk Map
          </button>
        </div>

        {/* Live Grid Key Numbers */}
        <div className="pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          <div>
            <span className="text-2xl font-black text-white font-mono">8 States</span>
            <p className="text-xs text-slate-400 m-0 mt-0.5">NER Territorial Coverage</p>
          </div>
          <div>
            <span className="text-2xl font-black text-sky-400 font-mono">30+ Passes</span>
            <p className="text-xs text-slate-400 m-0 mt-0.5">Critical Highway Sectors</p>
          </div>
          <div>
            <span className="text-2xl font-black text-purple-400 font-mono">99.5% F1</span>
            <p className="text-xs text-slate-400 m-0 mt-0.5">ML Ensemble Accuracy</p>
          </div>
          <div>
            <span className="text-2xl font-black text-rose-400 font-mono">&lt; 30 sec</span>
            <p className="text-xs text-slate-400 m-0 mt-0.5">Multi-Channel Warning Time</p>
          </div>
        </div>
      </div>

      {/* Architectural Pipeline Workflow */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white m-0">
            End-to-End Autonomous Surveillance Architecture
          </h2>
          <p className="text-xs text-slate-400 m-0">
            From downhole IoT sensor transducers to real-time citizen alert dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="font-mono text-[10px] text-sky-400 font-bold block">PHASE 1</span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-emerald-400" /> IoT & Satellite
            </div>
            <p className="text-slate-400 leading-relaxed m-0 text-[11px]">
              Continuous telemetry from borehole extensometers, biaxial tiltmeters, and rain gauges.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="font-mono text-[10px] text-sky-400 font-bold block">PHASE 2</span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <CloudRain className="h-4 w-4 text-cyan-400" /> Hydro-Processing
            </div>
            <p className="text-slate-400 leading-relaxed m-0 text-[11px]">
              24h and 7-day cumulative rainfall calculation with soil pore saturation modeling.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="font-mono text-[10px] text-sky-400 font-bold block">PHASE 3</span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-purple-400" /> AI/ML Inference
            </div>
            <p className="text-slate-400 leading-relaxed m-0 text-[11px]">
              Ensemble prediction estimating landslide probability and feature explainability attribution.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="font-mono text-[10px] text-sky-400 font-bold block">PHASE 4</span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" /> Dynamic Scoring
            </div>
            <p className="text-slate-400 leading-relaxed m-0 text-[11px]">
              Instantaneous physical stress combination producing normalized 0-100 risk indexes.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="font-mono text-[10px] text-sky-400 font-bold block">PHASE 5</span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-rose-400" /> Early Warning
            </div>
            <p className="text-slate-400 leading-relaxed m-0 text-[11px]">
              Multi-channel broadcast triggering SMS to cell towers, push alerts, and SDMA mobilizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
