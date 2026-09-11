import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CloudRain,
  FileText,
  Gauge,
  History,
  Map,
  Radio,
  Settings,
  Shield,
  Siren,
  SlidersHorizontal,
  Users,
  Globe,
  CheckCircle,
  Crown,
  Search,
  Sparkles
} from "lucide-react";
import { canSee, useAuth } from "./AuthContext";
import SimulationBar from "./components/SimulationBar";

export default function Layout() {
  const { user, role, switchRole, logout, lang, switchLang, t } = useAuth();
  const loc = useLocation();

  const isAdmin = role === "Admin";

  const LINKS = [
    { to: "/app/dashboard", label: t.commandCenter || "Command Center", icon: Gauge, min: "Disaster Management Authority", group: "Command & Operations" },
    { to: "/app/map", label: t.gisMap || "GIS Risk Map", icon: Map, min: "Citizen", group: "Public Multi-Hazard Grid" },
    { to: "/app/predict", label: t.aiStudio || "AI Prediction Studio", icon: Brain, min: "Field Officer", group: "AI & Geotechnical" },
    { to: "/app/explain", label: t.explainability || "Explainability & XAI", icon: Activity, min: "Field Officer", group: "AI & Geotechnical" },
    { to: "/app/rainfall", label: t.rainfall || "Rainfall & IMD Grid", icon: CloudRain, min: "Field Officer", group: "Sensors & Telemetry" },
    { to: "/app/sensors", label: t.sensors || "IoT Sensor Grid", icon: Radio, min: "Field Officer", group: "Sensors & Telemetry" },
    { to: "/app/history", label: t.incidentDatabase || "Disaster Database", icon: History, min: "Citizen", group: "Public Multi-Hazard Grid" },
    { to: "/app/alerts", label: t.alerts || "Early Warning Alerts", icon: Bell, min: "Citizen", group: "Public Multi-Hazard Grid" },
    { to: "/app/incidents", label: t.fieldReports || "Field & Community Reports", icon: AlertTriangle, min: "Citizen", group: "Public Multi-Hazard Grid" },
    { to: "/app/emergency", label: t.evacuation || "Emergency & Shelters", icon: Siren, min: "Disaster Management Authority", group: "Command & Operations" },
    { to: "/app/analytics", label: t.stateAnalytics || "State Analytics", icon: SlidersHorizontal, min: "Disaster Management Authority", group: "Command & Operations" },
    { to: "/app/users", label: t.usersRoles || "User & RBAC Management", icon: Users, min: "Admin", group: "System Administration" },
    { to: "/app/settings", label: t.thresholds || "Sensor Thresholds", icon: Settings, min: "Admin", group: "System Administration" },
    { to: "/app/reports", label: t.executiveReports || "Executive Reports", icon: FileText, min: "Disaster Management Authority", group: "Command & Operations" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-sm">
        <div className={`p-4 border-b border-slate-200 text-white ${isAdmin ? "bg-slate-950 border-b-purple-900" : "bg-slate-900"}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl font-black ${isAdmin ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/30" : "bg-emerald-500 text-slate-950"}`}>
              {isAdmin ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-black tracking-tight text-xs text-white block">
                {isAdmin ? "ADMIN COMMAND DIRECTORATE" : "NER MULTI-HAZARD EWS"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {isAdmin ? "Full System & Model Control" : "Public Safety Surveillance Grid"}
              </span>
            </div>
          </div>
        </div>

        {/* Current Active Panel Badge */}
        <div className={`px-4 py-2 text-[11px] font-bold flex items-center justify-between border-b ${
          isAdmin ? "bg-purple-50 text-purple-900 border-purple-200" : "bg-emerald-50 text-emerald-900 border-emerald-200"
        }`}>
          <span className="flex items-center gap-1.5">
            {isAdmin ? <Crown className="w-3.5 h-3.5 text-purple-700" /> : <Shield className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{isAdmin ? "👑 Admin Command Panel" : "🛡️ User Public Panel"}</span>
          </span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white font-black border border-current">
            {role}
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {LINKS.filter((l) => canSee(role, l.min)).map((l) => {
            const Icon = l.icon;
            const active = loc.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? isAdmin
                      ? "bg-purple-50 text-purple-950 border border-purple-300 shadow-xs"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? (isAdmin ? "text-purple-700" : "text-emerald-700") : "text-slate-400"}`} />
                <span>{l.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Operational · 8 NER States</span>
          </div>
          <p className="text-[10px] text-slate-400">IMD + Sentinel DEM + Richter Seismic Sensors</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
              <span className="hidden sm:inline font-black text-slate-900">{t.appTitle}</span>
              <span className="hidden lg:inline text-slate-300">|</span>
              <span className="hidden lg:inline text-slate-500 text-[11px]">{t.subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Multilingual Selector */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => switchLang(e.target.value)}
                className="bg-transparent border-0 text-slate-800 text-xs font-bold py-1 pr-2 focus:ring-0 cursor-pointer"
                title="Select Language"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="as">অসমীয়া (Assamese)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ne">नेपाली (Nepali)</option>
              </select>
            </div>

            {/* Role Switcher */}
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value)}
              className={`border rounded-xl text-xs font-bold px-2.5 py-1 focus:ring-1 ${
                isAdmin
                  ? "bg-purple-50 text-purple-900 border-purple-300 focus:ring-purple-500"
                  : "bg-slate-100 text-slate-700 border-slate-200 focus:ring-emerald-500"
              }`}
            >
              <option>Admin</option>
              <option>Disaster Management Authority</option>
              <option>Field Officer</option>
              <option>Citizen</option>
            </select>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.full_name || user.username}</span>
                  <span className="text-[10px] text-slate-400">{user.email || user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-red-600 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition"
              >
                Sign in
              </NavLink>
            )}
          </div>
        </header>

        {/* Body View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 bg-slate-50">
          <Outlet />
        </main>

        <SimulationBar />
      </div>
    </div>
  );
}
