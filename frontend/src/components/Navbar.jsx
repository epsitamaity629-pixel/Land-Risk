import React from "react";
import {
  ShieldAlert,
  Activity,
  Layers,
  CloudRain,
  Cpu,
  History,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  LifeBuoy,
  FileText,
  Radio,
  BarChart3,
  BrainCircuit,
  MapPin
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  simulationActive,
  onToggleSimulation,
  activeAlertsCount
}) {
  const roles = [
    { id: "admin", label: "Admin (Directorate)" },
    { id: "disaster_mgmt", label: "Disaster Mgmt (SDMA)" },
    { id: "field_officer", label: "Field Officer (GSI)" },
    { id: "citizen", label: "Public / Citizen" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Top emergency status bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            NER SURVEILLANCE GRID: ACTIVE
          </span>
          <span className="text-slate-500">|</span>
          <span>Coverage: 8 North Eastern States (Assam, Sikkim, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura)</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Active Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-sky-500"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
              simulationActive
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                : "bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            {simulationActive ? "Simulation Surging (Active)" : "Start Live Simulation"}
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab("dashboard")}
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white m-0">
                NER LANDSLIDE EARLY WARNING SYSTEM
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono font-bold">
                AI v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 m-0">
              National Disaster Management Authority | North Eastern Council
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("gis-map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "gis-map"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            GIS Risk Map
          </button>

          <button
            onClick={() => setActiveTab("ai-prediction")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ai-prediction"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            AI Predictor
          </button>

          <button
            onClick={() => setActiveTab("rainfall")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "rainfall"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <CloudRain className="h-3.5 w-3.5" />
            Rainfall
          </button>

          <button
            onClick={() => setActiveTab("sensors")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "sensors"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            IoT Sensors
          </button>

          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === "alerts"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Alerts
            {activeAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>

          <button
            onClick={() => setActiveTab("reporting")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "reporting"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            Report Incident
          </button>

          <button
            onClick={() => setActiveTab("emergency")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "emergency"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Emergency
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "analytics"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab("reports-export")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "reports-export"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Reports
          </button>
        </nav>
      </div>
    </header>
  );
}
