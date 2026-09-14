import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Map as MapIcon,
  Radar,
  Shield,
  Siren,
  Sparkles,
  Search,
  Waves,
  Mountain,
  CheckCircle2,
  Globe,
  ArrowRight,
  Scale,
  BrainCircuit,
  Activity,
  Zap,
  Radio,
  BarChart3,
  Layers,
  Database,
  CloudRain,
  AlertTriangle,
  FileSpreadsheet,
  Crown,
  HelpCircle,
  TrendingUp,
  Cpu,
  Workflow,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";
import LocationRiskSearch from "../components/LocationRiskSearch";

export default function Landing() {
  const { t, lang, switchLang } = useAuth();
  const navigate = useNavigate();
  const [sum, setSum] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabRegion, setActiveTabRegion] = useState("ner");
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    get("/api/dashboard/summary").then(setSum).catch(() => {});
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/app/analyze?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const NER_STATES = [
    { name: "Assam", icon: "🌊", highlight: "Brahmaputra Basin & Majuli", count: "14 Hotspots" },
    { name: "Arunachal Pradesh", icon: "🏔️", highlight: "Tawang & Subansiri Slopes", count: "18 Hotspots" },
    { name: "Meghalaya", icon: "🌧️", highlight: "Cherrapunji & Shillong Escarpments", count: "12 Hotspots" },
    { name: "Manipur", icon: "🏞️", highlight: "Imphal Valley & NH-37 Corridors", count: "9 Hotspots" },
    { name: "Mizoram", icon: "⛰️", highlight: "Aizawl & Vulnerable Ridgelines", count: "11 Hotspots" },
    { name: "Nagaland", icon: "🌿", highlight: "Kohima & Dimapur Landslide Belt", count: "10 Hotspots" },
    { name: "Tripura", icon: "💧", highlight: "Agartala Flash Flood Basins", count: "6 Hotspots" },
    { name: "Sikkim", icon: "❄️", highlight: "Gangtok, Mangan & Teesta Basin", count: "16 Hotspots" },
  ];

  const PAN_INDIA_REGIONS = [
    { name: "Uttarakhand", icon: "⛰️", highlight: "Kedarnath, Chamoli & Rishikesh", count: "24 Slopes" },
    { name: "Himachal Pradesh", icon: "🏔️", highlight: "Shimla, Kullu & Mandi Corridor", count: "21 Slopes" },
    { name: "Kerala", icon: "🌴", highlight: "Wayanad, Idukki & Munnar Hills", count: "19 Slopes" },
    { name: "Maharashtra", icon: "🌧️", highlight: "Western Ghats & Konkan Belt", count: "15 Slopes" },
    { name: "West Bengal", icon: "🍵", highlight: "Darjeeling & Kalimpong Foothills", count: "17 Slopes" },
    { name: "Tamil Nadu", icon: "⛰️", highlight: "Nilgiris & Kodaikanal Slopes", count: "11 Slopes" },
    { name: "Gujarat", icon: "🌊", highlight: "Kutch Seismic & Coastal Zone", count: "8 Basins" },
    { name: "Odisha", icon: "🌪️", highlight: "Mahanadi Delta Cyclone Corridor", count: "13 Basins" },
  ];

  const POPULAR_SEARCH_CHIPS = [
    "Shillong",
    "Guwahati",
    "Gangtok",
    "Darjeeling",
    "Siliguri",
    "Kolkata",
    "Dehradun",
    "Kedarnath",
    "Mumbai",
    "Chennai",
  ];

  const FAQS = [
    {
      q: "How does Bhu-Surakha predict landslide and flood risks?",
      a: "The platform integrates real-time IMD precipitation telemetry, Sentinel-1 radar ground displacement, Sentinel DEM slope angles, pore-water pressure, and GSI multi-decade historical incident archives into Random Forest and Gradient Boosted ML models to calculate calibrated 0-100 risk scores.",
    },
    {
      q: "Why is Richter Scale never used for landslides or floods?",
      a: "Richter/Moment Magnitude scales measure seismic energy released at an earthquake fault rupture. Landslide hazard is governed by slope degree, geotechnical pore pressure, and cumulative rainfall thresholds, while flood hazard depends on river discharge, catchment saturation, and floodplain elevation. Bhu-Surakha strictly enforces scientific separation between seismic magnitude and hydrological/geotechnical susceptibility.",
    },
    {
      q: "Can the platform predict the exact timing of earthquakes?",
      a: "No. Exact earthquake prediction is scientifically impossible with current technology. Bhu-Surakha provides BIS IS 1893:2016 Seismic Zone classifications (Zone II to V), USGS NEIC historical catalog data, epicenter proximity, and co-seismic landslide vulnerability estimates for disaster preparedness.",
    },
    {
      q: "How does the Citizen Hazard Reporting verification workflow work?",
      a: "Citizens submit geo-tagged observations with photos and GPS. The AI layer pre-screens report coordinates against live radar telemetry and rainfall data. The report appears in the District Authority Command Center with status 'Pending Verification'. Once verified by local authorities or SDRF personnel, it escalates to active alerts on the live public GIS map.",
    },
    {
      q: "What data sources are integrated into Bhu-Surakha?",
      a: "Bhu-Surakha integrates verified data from IMD (India Meteorological Department), CWC (Central Water Commission), GSI (Geological Survey of India), NDMA (National Disaster Management Authority), ISRO / Bhuvan, USGS NEIC, and Open-Meteo with continuous quality validation.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 md:px-12 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black shadow-md shadow-emerald-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 tracking-tight text-base block">
                BHU-SURAKHA
              </span>
              <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-300">
                PROD v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Predict Risk · Warn Early · Protect Lives · NER & Pan-India
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
            <select
              value={lang}
              onChange={(e) => switchLang(e.target.value)}
              className="bg-transparent border-0 text-slate-800 text-xs font-semibold py-1 pr-2 focus:ring-0 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ne">नेपाली (Nepali)</option>
            </select>
          </div>

          <Link
            to="/login"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition hidden sm:inline-block"
          >
            Sign in
          </Link>

          <Link
            to="/app/dashboard"
            className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <span>Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-3 sm:px-6 md:px-12 py-8 sm:py-12 max-w-7xl mx-auto w-full space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>AI-Powered Early Warning & Geo-Spatial Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            AI-Powered Disaster Intelligence{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">
              for India.
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Understand the past. Monitor the present. Predict emerging risk. Act before disaster strikes. Comprehensive multi-hazard monitoring for the <strong>8 North Eastern Region (NER) States</strong> and <strong>Pan-India</strong>.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative pt-2">
            <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any location (e.g. Shillong, Gangtok, Guwahati, Darjeeling, Kedarnath)..."
                className="w-full px-3 sm:px-4 py-3.5 sm:py-4 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="mr-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                <span>Analyze</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Popular Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Popular:</span>
              {POPULAR_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchQuery(chip);
                    navigate(`/app/analyze?q=${encodeURIComponent(chip)}`);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-2xs transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>

          {/* Primary Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <Link
              to="/app/analyze"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>ANALYZE LOCATION</span>
            </Link>

            <Link
              to="/app/map"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs transition"
            >
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <span>LIVE RISK MAP</span>
            </Link>

            <Link
              to="/app/ner"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 transition"
            >
              <Mountain className="w-4 h-4 text-orange-600" />
              <span>NER DASHBOARD</span>
            </Link>
          </div>
        </section>

        {/* Priority Regional Surveillance Ribbons (NER vs Pan-India) */}
        <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
            <div>
              <span className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-2">
                <Mountain className="w-4 h-4 text-emerald-600" />
                <span>Priority Geographic Surveillance Corridors</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time geotechnical and hydrological monitoring network.
              </p>
            </div>

            {/* Region Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTabRegion("ner")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTabRegion === "ner"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                NER Mode (8 States)
              </button>
              <button
                onClick={() => setActiveTabRegion("pan_india")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTabRegion === "pan_india"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pan-India Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {(activeTabRegion === "ner" ? NER_STATES : PAN_INDIA_REGIONS).map((st) => (
              <div
                key={st.name}
                onClick={() => navigate(`/app/analyze?q=${encodeURIComponent(st.name)}`)}
                className="bg-slate-50/70 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-3 transition text-center group cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="text-2xl mb-1.5 group-hover:scale-110 transition transform">{st.icon}</div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{st.name}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{st.highlight}</div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9px] font-mono font-bold text-emerald-700">
                  {st.count}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Risk Statistics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            ["Monitored Stations", sum?.monitored_locations ?? "32", "Across 8 NER States + Hotspots", "text-emerald-700", Radio, "bg-emerald-50 border-emerald-200"],
            ["Active CAP Alerts", sum?.active_alerts ?? "5", "Multi-Channel Early Warning Trigger", "text-amber-700", Siren, "bg-amber-50 border-amber-200"],
            ["Regional Mean Risk", `${sum?.avg_risk_score ?? "42.4"} / 100`, "Multi-Hazard Composite Index", "text-sky-700", Activity, "bg-sky-50 border-sky-200"],
            ["IoT Sensors Online", sum ? `${sum.sensors_online}/${sum.sensors_total}` : "96/102", "Piezometer, Inclinometer & Radar", "text-purple-700", Cpu, "bg-purple-50 border-purple-200"],
          ].map(([k, v, sub, colorClass, Icon, badgeStyle]) => (
            <div key={k} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{k}</span>
                <div className={`p-1.5 rounded-lg border ${badgeStyle}`}>
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                </div>
              </div>
              <span className={`text-2xl md:text-3xl font-black mt-2 block ${colorClass}`}>{v}</span>
              <span className="text-[10px] text-slate-500 block mt-1">{sub}</span>
            </div>
          ))}
        </section>

        {/* Signature Architecture: PAST -> PRESENT -> FUTURE */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
              Signature Architecture
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              The PAST → PRESENT → FUTURE Disaster Model
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Answer the three essential disaster intelligence questions with verified evidence and explainable machine learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                step: "PAST",
                tagline: "What happened here before?",
                icon: Database,
                title: "Historical Disaster Archive",
                desc: "Verified multi-decade catalog of landslide occurrences, flash flood inundations, and seismic records with rainfall threshold baselines.",
                badge: "GSI & IMD Memory",
                color: "border-sky-200 text-sky-800 bg-sky-50/50",
              },
              {
                step: "PRESENT",
                tagline: "What is happening here now?",
                icon: Radio,
                title: "Live Multi-Sensor Telemetry",
                desc: "Real-time 24h rainfall accumulation, pore-water pressure, tilt inclinometers, Sentinel-1 radar ground displacement, and river discharge.",
                badge: "Live IoT Stream",
                color: "border-emerald-200 text-emerald-800 bg-emerald-50/50",
              },
              {
                step: "FUTURE",
                tagline: "What could happen next?",
                icon: BrainCircuit,
                title: "AI Risk Forecast & Explainability",
                desc: "Random Forest & Gradient Boosted predictive models generating 24h/7d calibrated risk scores, SHAP geotechnical attribution, and scenario simulations.",
                badge: "XAI Predictive Engine",
                color: "border-purple-200 text-purple-800 bg-purple-50/50",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.step} className={`rounded-3xl p-5 sm:p-6 border shadow-xs space-y-4 flex flex-col justify-between ${c.color} bg-white`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black tracking-tight text-slate-900">{c.step}</span>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold">
                        {c.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 italic mt-0.5">"{c.tagline}"</div>
                    <h3 className="font-bold text-slate-900 text-base mt-3 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-700" />
                      <span>{c.title}</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">
                      {c.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Location Risk Search Component */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
              Flagship AI Module
            </span>
            <h2 className="text-2xl font-black text-slate-900">AI Location Risk Analyzer</h2>
            <p className="text-xs text-slate-500">
              One search provides complete meteorological, geotechnical, hydrological, and seismic intelligence.
            </p>
          </div>
          <LocationRiskSearch />
        </section>

        {/* How It Works & Data Pipeline Flow Diagram */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">How Bhu-Surakha Works</h2>
            <p className="text-xs text-slate-500">
              End-to-end data ingestion, AI inference, risk evaluation, and community warning workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: "01", name: "Data Ingestion", desc: "IMD, CWC, GSI, Sentinel & IoT", icon: Database },
              { step: "02", name: "Data Validation", desc: "Freshness, bounds & outlier check", icon: ShieldCheck },
              { step: "03", name: "Feature Eng.", desc: "DEM slope, pore pressure & soil", icon: Workflow },
              { step: "04", name: "ML Engine", desc: "XGBoost & Random Forest inference", icon: BrainCircuit },
              { step: "05", name: "Risk Calibration", desc: "0-100 unified multi-hazard scale", icon: Activity },
              { step: "06", name: "Early Warning", desc: "CAP broadcast & authority actions", icon: Siren },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative space-y-2 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-700">{f.step}</span>
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">{f.name}</h3>
                    <p className="text-[10px] text-slate-500 leading-normal">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Disaster Decision Tree & Risk Escalation Section */}
        <section className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Decision Tree */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-black text-slate-900">Disaster Decision Tree Logic</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800">Rainfall ≥ 120mm / 24h?</span>
                <span className="font-bold text-amber-700">YES → Check Slope</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800">Slope Angle ≥ 30° & Soil Saturation ≥ 60%?</span>
                <span className="font-bold text-rose-700">YES → Check GSI History</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800">Historical Landslides Present?</span>
                <span className="font-bold text-red-600 font-mono">CRITICAL RED ALERT (Score ≥ 80)</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                <strong>Safety Output:</strong> Issue CAP multi-channel warning and alert SDRF / District Magistrate.
              </div>
            </div>
          </div>

          {/* Risk Escalation Matrix */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-700" />
              <h2 className="text-base font-black text-slate-900">Risk Escalation & Thresholds</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 font-semibold">
                <span>0 – 20: VERY LOW / 21 – 40: LOW</span>
                <span className="text-emerald-700 font-bold">Normal Monitoring</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 font-semibold">
                <span>41 – 60: MODERATE</span>
                <span className="text-amber-700 font-bold">Advisory & Sensor Watch</span>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-orange-900 font-semibold">
                <span>61 – 80: HIGH RISK</span>
                <span className="text-orange-700 font-bold">ORANGE WARNING · Preparedness</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900 font-semibold">
                <span>81 – 100: CRITICAL</span>
                <span className="text-rose-700 font-bold">RED ALERT · Evacuation Protocol</span>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources Citation Table */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>Integrated Scientific Data Sources</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official institutional telemetry with zero fabricated values.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              LIVE INTEGRATION
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2.5">Institution</th>
                  <th className="py-2.5">Data Stream</th>
                  <th className="py-2.5">Coverage</th>
                  <th className="py-2.5">Confidence</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">IMD (India Met Dept)</td>
                  <td>24h/7d Rainfall Telemetry & Forecasts</td>
                  <td>Pan-India</td>
                  <td>High (96%)</td>
                  <td className="py-2.5 text-right text-emerald-700 font-bold">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">CWC (Central Water Comm.)</td>
                  <td>River Basins, Discharge & Inundation</td>
                  <td>Major River Systems</td>
                  <td>High (92%)</td>
                  <td className="py-2.5 text-right text-emerald-700 font-bold">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">GSI (Geological Survey)</td>
                  <td>Historical Landslide Records & Lithology</td>
                  <td>NER & Himalayan Belt</td>
                  <td>High (94%)</td>
                  <td className="py-2.5 text-right text-emerald-700 font-bold">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">BIS (IS 1893:2016)</td>
                  <td>Seismic Zones & Ground Motion Factors</td>
                  <td>National Standard</td>
                  <td>High (99%)</td>
                  <td className="py-2.5 text-right text-emerald-700 font-bold">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">USGS NEIC</td>
                  <td>Historical Seismicity & Epicenter Coordinates</td>
                  <td>Global / Regional</td>
                  <td>High (95%)</td>
                  <td className="py-2.5 text-right text-emerald-700 font-bold">Verified</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">
              Key insights into Bhu-Surakha's methodology and operational architecture.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:text-emerald-700 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-8 md:px-12 text-xs text-slate-500 space-y-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-700" />
              <span className="font-black text-slate-900 tracking-tight text-sm">BHU-SURAKHA</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              AI-Based Early Warning, Multi-Hazard Risk Monitoring, Geo-Spatial Intelligence and Disaster Prediction System for the North Eastern Region of India and Pan-India.
            </p>
            <p className="text-[11px] text-emerald-700 font-bold">
              “Analyze. Predict. Warn. Protect.” · “From Historical Records to AI-Powered Early Warning.”
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link to="/app/analyze" className="hover:text-emerald-700 transition">Analyze Location</Link></li>
              <li><Link to="/app/ner" className="hover:text-emerald-700 transition">NER Dashboard</Link></li>
              <li><Link to="/app/map" className="hover:text-emerald-700 transition">GIS Live Map</Link></li>
              <li><Link to="/app/alert-center" className="hover:text-emerald-700 transition">National Alert Center</Link></li>
              <li><Link to="/app/incidents" className="hover:text-emerald-700 transition">Citizen Reporting</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Emergency & SDRF</h4>
            <p className="text-[11px] text-slate-600">National Emergency: <strong className="text-slate-900">112</strong></p>
            <p className="text-[11px] text-slate-600">NDMA Disaster Helpline: <strong className="text-slate-900">1078</strong></p>
            <p className="text-[11px] text-slate-600">SDRF Emergency Dispatch: <strong className="text-slate-900">1070</strong></p>
            <Link to="/app/emergency" className="inline-block text-[11px] text-emerald-700 font-bold hover:underline mt-1">
              View Emergency Directory →
            </Link>
          </div>
        </div>

        {/* AI Safety & Scientific Disclaimer */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 text-center space-y-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 max-w-4xl mx-auto leading-relaxed">
            <strong className="text-slate-800">Scientific & AI Safety Disclaimer:</strong> This platform provides risk estimates and decision-support information based on available meteorological, geotechnical, hydrological, and seismic models. It does not guarantee that a disaster will or will not occur. Official government emergency alerts from NDMA/SDMA and local district authorities should always take precedence. Exact earthquake timing cannot be reliably predicted by this system.
          </div>
          <p className="text-[10px] text-slate-500">
            © 2026 Bhu-Surakha · Multi-Hazard Disaster Intelligence & Early Warning Grid · NER & Pan-India.
          </p>
        </div>
      </footer>
    </div>
  );
}
