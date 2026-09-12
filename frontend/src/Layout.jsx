import { useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
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
  Sparkles,
  Scale,
  Mountain,
  ShieldAlert,
  MapPin,
  User,
  Play,
  Menu,
  X,
  ChevronRight,
  Layers,
  Compass
} from "lucide-react";
import { canSee, useAuth } from "./AuthContext";
import SimulationBar from "./components/SimulationBar";
import { GlobalWarningBar } from "./components/EarlyWarningBanner";
import OnboardingModal from "./components/OnboardingModal";
import AIChatAssistant from "./components/AIChatAssistant";

export default function Layout() {
  const { user, role, switchRole, logout, lang, switchLang, t, isOnboarded, completeOnboarding } = useAuth();
  const loc = useLocation();

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = role === "Admin";

  const NAVIGATION_GROUPS = [
    {
      title: "🎯 Command & Priority Analysis",
      items: [
        { to: "/app/dashboard", label: t.commandCenter || "Command Center", icon: Gauge, min: "Citizen" },
        { to: "/app/ner", label: "NER Dashboard (8 States)", icon: Mountain, min: "Citizen" },
        { to: "/app/analyze", label: "Analyze Any Location", icon: MapPin, min: "Citizen" },
        { to: "/app/alert-center", label: "Alert Centre & CAP", icon: ShieldAlert, min: "Citizen" },
        { to: "/app/authority", label: "Authority Command", icon: Crown, min: "Disaster Management Authority" },
      ],
    },
    {
      title: "🗺️ Multi-Hazard GIS & Data",
      items: [
        { to: "/app/map", label: t.gisMap || "GIS Risk Map", icon: Map, min: "Citizen" },
        { to: "/app/compare", label: t.locationCompare || "Location Comparison", icon: Scale, min: "Citizen" },
        { to: "/app/history", label: t.incidentDatabase || "Disaster Database", icon: History, min: "Citizen" },
        { to: "/app/alerts", label: t.alerts || "Early Warning Alerts", icon: Bell, min: "Citizen" },
        { to: "/app/incidents", label: t.fieldReports || "Community Field Reports", icon: AlertTriangle, min: "Citizen" },
      ],
    },
    {
      title: "🧠 AI Forecasting & Telemetry",
      items: [
        { to: "/app/predict", label: t.aiStudio || "AI Prediction Studio", icon: Brain, min: "Field Officer" },
        { to: "/app/explain", label: t.explainability || "Explainability & XAI", icon: Activity, min: "Field Officer" },
        { to: "/app/rainfall", label: t.rainfall || "Rainfall & IMD Grid", icon: CloudRain, min: "Field Officer" },
        { to: "/app/sensors", label: t.sensors || "IoT Sensor Grid", icon: Radio, min: "Field Officer" },
      ],
    },
    {
      title: "🚨 Emergency & Executive",
      items: [
        { to: "/app/emergency", label: t.evacuation || "Emergency & Shelters", icon: Siren, min: "Disaster Management Authority" },
        { to: "/app/analytics", label: t.stateAnalytics || "State Analytics", icon: SlidersHorizontal, min: "Disaster Management Authority" },
        { to: "/app/reports", label: t.executiveReports || "Executive Reports", icon: FileText, min: "Disaster Management Authority" },
      ],
    },
    {
      title: "⚙️ User & Administration",
      items: [
        { to: "/app/profile", label: "My Profile & Places", icon: User, min: "Citizen" },
        { to: "/app/users", label: t.usersRoles || "User & RBAC", icon: Users, min: "Admin" },
        { to: "/app/settings", label: t.thresholds || "Sensor Thresholds", icon: Settings, min: "Admin" },
      ],
    },
  ];

  const renderNavGroup = (group, isMobile = false) => {
    const visibleItems = group.items.filter((l) => canSee(role, l.min));
    if (visibleItems.length === 0) return null;

    return (
      <div key={group.title} className="space-y-1">
        <div className="px-3 pt-3 pb-1 text-[10px] font-black tracking-wider uppercase text-slate-400">
          {group.title}
        </div>
        {visibleItems.map((l) => {
          const Icon = l.icon;
          const active = loc.pathname === l.to;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                active
                  ? isAdmin
                    ? "bg-purple-50 text-purple-950 border border-purple-300 font-bold shadow-xs"
                    : "bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? (isAdmin ? "text-purple-700" : "text-emerald-700") : "text-slate-400"
                }`}
              />
              <span className="truncate">{l.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-600 shrink-0" />}
            </NavLink>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={() => {
          completeOnboarding();
          setShowOnboardingModal(false);
        }}
      />

      {/* ── Desktop Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white hidden lg:flex flex-col shadow-xs sticky top-0 h-screen">
        {/* Brand Header */}
        <Link
          to="/"
          className="p-4 border-b border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl font-black bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black tracking-tight text-sm text-slate-900 block">
                BHU-SURAKHA
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                Predict · Warn · Protect
              </span>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            v2.4
          </span>
        </Link>

        {/* Live Grid Status Badge */}
        <div className="px-4 py-2 text-[11px] font-bold flex items-center justify-between border-b bg-emerald-50/70 text-emerald-950 border-emerald-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Multi-Hazard Grid Active</span>
          </span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-emerald-700 font-black border border-emerald-300">
            LIVE 24/7
          </span>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">
          {NAVIGATION_GROUPS.map((group) => renderNavGroup(group, false))}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Operational · 8 NER States</span>
            </div>
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="text-[10px] text-slate-500 hover:text-emerald-700 font-bold underline cursor-pointer"
            >
              Onboarding
            </button>
          </div>
          <p className="text-[10px] text-slate-400">IMD + Sentinel DEM + GSI Incident Archives</p>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer Modal ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-sm text-slate-900 block">BHU-SURAKHA</span>
                  <span className="text-[10px] text-emerald-700 font-bold block">Disaster Intelligence</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">
              {NAVIGATION_GROUPS.map((group) => renderNavGroup(group, true))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">
                    {user.full_name || user.username}
                  </span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Pane ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-2xs">
          <GlobalWarningBar />
          <div className="h-14 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Mobile Menu Toggle & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="lg:hidden flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-slate-900 tracking-tight">BHU-SURAKHA</span>
              </Link>

              <div className="hidden lg:flex items-center gap-2 text-slate-700 text-xs font-medium">
                <span className="font-black text-slate-900">{t.appTitle || "Bhu-Surakha Platform"}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 text-[11px] truncate">{t.subtitle || "AI Early Warning Grid"}</span>
              </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 shrink-0">
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

              {/* User Session */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/app/profile"
                    className="hidden sm:flex flex-col text-right hover:opacity-80 transition"
                    title="View Profile & Saved Places"
                  >
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                      {user.full_name || user.username}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-500 hover:text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl shadow-xs transition"
                >
                  Sign in
                </NavLink>
              )}
            </div>
          </div>
        </header>

        {/* Main Body View Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-28 bg-slate-50">
          <Outlet />
        </main>

        <SimulationBar />
        <AIChatAssistant />

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
          <div className="flex items-center justify-around px-1 py-1.5">
            {[
              { to: "/app/dashboard", icon: Gauge, label: "Home" },
              { to: "/app/map", icon: Map, label: "GIS Map" },
              { to: "/app/analyze", icon: MapPin, label: "Analyze" },
              { to: "/app/alert-center", icon: ShieldAlert, label: "Alerts" },
              { to: "/app/ner", icon: Mountain, label: "NER 8" },
            ].map(({ to, icon: Icon, label }) => {
              const active = loc.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition min-w-0 ${
                    active ? "text-emerald-700 font-bold" : "text-slate-500"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                  <span className={`text-[10px] ${active ? "text-emerald-700 font-black" : "text-slate-500"}`}>
                    {label}
                  </span>
                  {active && <div className="w-1.5 h-1 rounded-full bg-emerald-600" />}
                </NavLink>
              );
            })}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-slate-500 hover:text-slate-900 transition"
            >
              <Menu className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-500">More</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
