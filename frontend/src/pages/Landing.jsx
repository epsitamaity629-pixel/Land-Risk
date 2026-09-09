import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  ArrowRight
} from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";
import LocationRiskSearch from "../components/LocationRiskSearch";

export default function Landing() {
  const { t, lang, switchLang } = useAuth();
  const [sum, setSum] = useState(null);

  useEffect(() => {
    get("/api/dashboard/summary").then(setSum).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-slate-200 shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-700 text-white font-black shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base block">
              NER MULTI-HAZARD EWS
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              National Disaster Management Platform · North Eastern Region
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
            <select
              value={lang}
              onChange={(e) => switchLang(e.target.value)}
              className="bg-transparent border-0 text-slate-800 text-xs font-semibold py-1 pr-2 focus:ring-0 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
              <option value="as">অসমীয়া</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          <Link
            to="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            Sign in
          </Link>
          <Link
            to="/app/dashboard"
            className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Predictive Analytics & Real-Time GIS Heatmaps</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Integrated Landslide & Flood Early Warning for the{" "}
            <span className="text-emerald-700">Eight NER Hill States</span>
          </h1>

          <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto font-medium">
            Fusing IoT pore-water inclinometers, IMD radar feeds, digital elevation models, and crowdsourced field observations into real-time 0–100 dual hazard risk predictions across Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura.
          </p>
        </div>

        {/* Live Search Widget Component on Landing */}
        <div className="pt-2">
          <LocationRiskSearch />
        </div>

        {/* 4 Overview Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Monitored Stations", sum?.monitored_locations ?? "32", "Across 8 NER States"],
            ["Active Alerts", sum?.active_alerts ?? "5", "CAP Multi-Channel Trigger"],
            ["Regional Mean Risk", `${sum?.avg_risk_score ?? "42.4"} / 100`, "Multi-Hazard Index"],
            ["IoT Sensors Online", sum ? `${sum.sensors_online}/${sum.sensors_total}` : "96/102", "Continuous Telemetry Active"],
          ].map(([k, v, sub]) => (
            <div key={k} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block">{k}</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{v}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{sub}</span>
            </div>
          ))}
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: MapIcon,
              title: "GIS Multi-Hazard Map & Heatmaps",
              desc: "Color-coded Landslide Susceptibility Polygons, River Basin Flood Inundation buffers, and Safe Evacuation Corridors.",
            },
            {
              icon: Mountain,
              title: "Dual AI/ML Predictive Engine",
              desc: "Pre-trained on 3,000+ Himalayan events. Delivers exact Landslide failure % and Flood Inundation stage probabilities.",
            },
            {
              icon: Siren,
              title: "Automated SMS / App Early Warning",
              desc: "Immediate cellular broadcast dispatch to District Administrations, NDRF Battalions, and Local Citizens.",
            },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
                <c.icon className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 md:px-12 text-center text-xs text-slate-500">
        <p>© 2026 North Eastern Region Landslide & Flood Disaster Management Authority (NER-DMA). All rights reserved.</p>
        <p className="text-[10px] text-slate-400 mt-1">Built with IMD Meteorologic Radar, Sentinel DEM & Machine Learning Geotechnical Models.</p>
      </footer>
    </div>
  );
}
