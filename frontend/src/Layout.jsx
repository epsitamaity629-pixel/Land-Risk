import { useState } from "react";
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
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { canSee, useAuth } from "./AuthContext";
import SimulationBar from "./components/SimulationBar";
import AIChatbot from "./components/AIChatbot";

export default function Layout() {
  const { user, role, switchRole, logout, lang, switchLang, t } = useAuth();
  const loc = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const LINKS = [
    { to: "/app/dashboard", label: t.commandCenter || "Command Center", icon: Gauge, min: "Disaster Management Authority" },
    { to: "/app/map", label: t.gisMap || "GIS Risk Map", icon: Map, min: "Citizen" },
    { to: "/app/predict", label: t.aiStudio || "AI Risk Intelligence", icon: Brain, min: "Field Officer" },
    { to: "/app/explain", label: t.explainability || "Factor Explainability", icon: Activity, min: "Field Officer" },
    { to: "/app/rainfall", label: t.rainfall || "Rainfall Telemetry", icon: CloudRain, min: "Field Officer" },
    { to: "/app/sensors", label: t.sensors || "IoT Sensor Grid", icon: Radio, min: "Field Officer" },
    { to: "/app/history", label: t.incidentDatabase || "Historical Archive", icon: History, min: "Citizen" },
    { to: "/app/alerts", label: t.alerts || "Early Warnings", icon: Bell, min: "Citizen" },
    { to: "/app/incidents", label: t.fieldReports || "Field Reports", icon: AlertTriangle, min: "Citizen" },
    { to: "/app/emergency", label: t.evacuation || "Emergency & Evacuation", icon: Siren, min: "Disaster Management Authority" },
    { to: "/app/analytics", label: t.stateAnalytics || "State Analytics", icon: SlidersHorizontal, min: "Disaster Management Authority" },
    { to: "/app/users", label: t.usersRoles || "Users & Roles", icon: Users, min: "Admin" },
    { to: "/app/settings", label: t.thresholds || "System Settings", icon: Settings, min: "Admin" },
    { to: "/app/reports", label: t.executiveReports || "Executive Reports", icon: FileText, min: "Disaster Management Authority" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative">
      {/* Sidebar: Clean White Professional BHU-SURAKSHA Branding */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-slate-950 font-black shadow-md shadow-emerald-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-sm text-white block">BHU-SURAKSHA</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block tracking-wider uppercase">
                Predict · Warn · Protect
              </span>
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-emerald-700 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{l.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Multi-Hazard Grid Active</span>
            </span>
            <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">
              LIVE 24/7
            </span>
          </div>
          <p className="text-[10px] text-slate-500">8 NER States + Pan-India Corridor</p>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden flex">
          <div className="w-72 bg-white h-full flex flex-col shadow-2xl animate-fadeIn">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-sm text-white">BHU-SURAKSHA</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {LINKS.filter((l) => canSee(role, l.min)).map((l) => {
                const Icon = l.icon;
                const active = loc.pathname === l.to;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      active ? "bg-emerald-700 text-white font-bold" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{l.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 md:hidden"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-700 hidden sm:inline" />
                BHU-SURAKSHA
              </span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden md:inline text-slate-500 text-[11px]">
                Multi-Hazard Intelligence Grid (Predict · Warn · Protect)
              </span>
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
              className="bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-2 py-1 focus:ring-1 focus:ring-emerald-500 hidden sm:block"
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
                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg shadow-xs transition"
              >
                Sign in
              </NavLink>
            )}
          </div>
        </header>

        {/* Body View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 bg-slate-50">
          <Outlet />
        </main>

        <SimulationBar />

        {/* Real-time AI Assistant Chatbot */}
        <AIChatbot />
      </div>
    </div>
  );
}
