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
  ExternalLink
} from "lucide-react";
import { canSee, useAuth } from "./AuthContext";
import SimulationBar from "./components/SimulationBar";

export default function Layout() {
  const { user, role, switchRole, logout, lang, switchLang, t } = useAuth();
  const loc = useLocation();

  const LINKS = [
    { to: "/app/dashboard", label: t.commandCenter, icon: Gauge, min: "Disaster Management Authority" },
    { to: "/app/map", label: t.gisMap, icon: Map, min: "Citizen" },
    { to: "/app/predict", label: t.aiStudio, icon: Brain, min: "Field Officer" },
    { to: "/app/explain", label: t.explainability, icon: Activity, min: "Field Officer" },
    { to: "/app/rainfall", label: t.rainfall, icon: CloudRain, min: "Field Officer" },
    { to: "/app/sensors", label: t.sensors, icon: Radio, min: "Field Officer" },
    { to: "/app/history", label: t.incidentDatabase, icon: History, min: "Citizen" },
    { to: "/app/alerts", label: t.alerts, icon: Bell, min: "Citizen" },
    { to: "/app/incidents", label: t.fieldReports, icon: AlertTriangle, min: "Citizen" },
    { to: "/app/emergency", label: t.evacuation, icon: Siren, min: "Disaster Management Authority" },
    { to: "/app/analytics", label: t.stateAnalytics, icon: SlidersHorizontal, min: "Disaster Management Authority" },
    { to: "/app/users", label: t.usersRoles, icon: Users, min: "Admin" },
    { to: "/app/settings", label: t.thresholds, icon: Settings, min: "Admin" },
    { to: "/app/reports", label: t.executiveReports, icon: FileText, min: "Disaster Management Authority" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar: Clean White Professional Theme */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm text-white block">NER EWS PLATFORM</span>
              <span className="text-[10px] text-slate-400 font-medium block">Multi-Hazard Control Grid</span>
            </div>
          </div>
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-400"}`} />
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
          <p className="text-[10px] text-slate-400">IMD + Sentinel DEM + Inclinometers</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
              <span className="hidden sm:inline font-bold text-slate-900">{t.appTitle}</span>
              <span className="hidden lg:inline text-slate-400">|</span>
              <span className="hidden lg:inline text-slate-500 text-[11px]">{t.subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Multilingual Selector */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => switchLang(e.target.value)}
                className="bg-transparent border-0 text-slate-800 text-xs font-semibold py-1 pr-2 focus:ring-0 cursor-pointer"
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
              className="bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-2 py-1 focus:ring-1 focus:ring-emerald-500"
            >
              <option>Admin</option>
              <option>Disaster Management Authority</option>
              <option>Field Officer</option>
              <option>Citizen</option>
            </select>

            {user ? (
              <button
                onClick={logout}
                className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                Sign out
              </button>
            ) : (
              <NavLink
                to="/login"
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition"
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
