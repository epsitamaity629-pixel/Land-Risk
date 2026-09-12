import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Mountain,
  MapPin,
  Waves,
  Activity,
  CloudRain,
  ShieldAlert,
  BrainCircuit,
  FileSpreadsheet,
  Crown,
  Scale,
  Siren,
  HelpCircle,
  TrendingUp,
  Radio,
  Share2
} from "lucide-react";

export default function PresentationTour({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    {
      id: 1,
      title: "1. National Command Center Homepage",
      category: "Platform Overview",
      route: "/",
      icon: Sparkles,
      desc: "Production command-center interface with real-time multi-hazard statistics, 8 NER priority surveillance states ribbon, and Pan-India search.",
      highlight: "Notice the 3-Pillar Disaster Intelligence Architecture and live telemetry counters.",
    },
    {
      id: 2,
      title: "2. North Eastern Region (NER) Dashboard",
      category: "Regional Focus",
      route: "/app/ner",
      icon: Mountain,
      desc: "State-wise and district-wise disaster vulnerability ranking across Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim.",
      highlight: "Includes Pan-India switch to monitor Western Ghats, Himalayas, and coastal zones.",
    },
    {
      id: 3,
      title: "3. Live Interactive GIS Multi-Hazard Map",
      category: "Geospatial Intelligence",
      route: "/app/map",
      icon: Radio,
      desc: "Full-screen GIS map with multi-hazard layers (Landslides, Floods, Earthquakes, Rivers, Roads, Citizen Reports) and clickable regional analysis popups.",
      highlight: "Click any marker to trigger instant AI analysis.",
    },
    {
      id: 4,
      title: "4. Universal Location Search & Geocoding",
      category: "Location Intelligence",
      route: "/app/analyze?q=Shillong",
      icon: MapPin,
      desc: "Search any Indian city, town, hill station, tourist spot, highway, or GPS coordinates to instantly pull live IMD weather, Sentinel DEM elevation, and geology.",
      highlight: "Supports Voice Search via Web Speech API.",
    },
    {
      id: 5,
      title: "5. PAST → PRESENT → FUTURE Signature Cards",
      category: "Signature Architecture",
      route: "/app/analyze?q=Shillong",
      icon: TrendingUp,
      desc: "Three interactive pillars: PAST (Historical disaster records), PRESENT (Live rainfall and IoT sensors), FUTURE (AI model-based risk forecast).",
      highlight: "Supported by a multi-epoch graph distinguishing Observed vs Modelled vs Forecast.",
    },
    {
      id: 6,
      title: "6. Current Weather & IMD Rainfall Telemetry",
      category: "Meteorological Grid",
      route: "/app/rainfall",
      icon: CloudRain,
      desc: "High-precision IMD telemetry showing 1h, 3h, 6h, 12h, 24h, 3-day, and 7-day cumulative rainfall with intensity charts and cloudburst thresholds.",
      highlight: "Live meteorological updates with zero fabricated numbers.",
    },
    {
      id: 7,
      title: "7. Landslide Intelligence & Slope Geotechnics",
      category: "Hazard Deep Dive",
      route: "/app/analyze?q=Shillong",
      icon: Mountain,
      desc: "Slope angle, terrain roughness, pore-water pressure, soil moisture, lithological formation, and rainfall trigger thresholds for landslide susceptibility.",
      highlight: "Strict scientific rule: Richter scale is never used for landslides.",
    },
    {
      id: 8,
      title: "8. Flood & River Basin Hydrology",
      category: "Hazard Deep Dive",
      route: "/app/analyze?q=Guwahati",
      icon: Waves,
      desc: "River proximity, discharge rates, Brahmaputra basin elevation differentials, floodplain exposure, and catchment saturation.",
      highlight: "Real-time flood probability calculated without Richter scale misuse.",
    },
    {
      id: 9,
      title: "9. Earthquake & BIS IS 1893:2016 Seismic Module",
      category: "Seismicity & Safety",
      route: "/app/analyze?q=Shillong",
      icon: Activity,
      desc: "BIS IS 1893:2016 Seismic Zones (Zone II-V), USGS historical epicenters, depth, distance, magnitude scale tiers (Micro to Great), and co-seismic landslide risk.",
      highlight: "Explicit scientific safety disclaimer that exact earthquake timing cannot be predicted.",
    },
    {
      id: 10,
      title: "10. 13-Section Structured AI Risk Analysis",
      category: "AI Reasoning",
      route: "/app/analyze?q=Shillong",
      icon: BrainCircuit,
      desc: "13 comprehensive AI sections: Location Summary, Current Conditions, Historical Risk, Current Risk, Future Outlook, Main Hazards, Risk Drivers, Vulnerable Areas, Potential Impact, Actions, Warnings, Data Confidence, Uncertainty.",
      highlight: "Strict no-hallucination policy with data freshness stamps.",
    },
    {
      id: 11,
      title: "11. Explainable AI & Geotechnical SHAP ('Why Red?')",
      category: "Explainability",
      route: "/app/explain",
      icon: BrainCircuit,
      desc: "Feature importance breakdown showing exactly WHY a location is at risk (Rainfall %, Slope %, Soil Moisture %, Historical %, Elevation %) and positive/negative risk contributors.",
      highlight: "Transparent AI explainability instead of black-box predictions.",
    },
    {
      id: 12,
      title: "12. What-If AI Disaster Scenario Simulator",
      category: "Interactive Simulation",
      route: "/app/analyze?q=Shillong",
      icon: Share2,
      desc: "Interactive sliders to simulate +30% or +50% rainfall surges, soil moisture spikes, and river level rises, recalculating risk in real-time.",
      highlight: "Compares Before vs After risk scores with AI change explanation.",
    },
    {
      id: 13,
      title: "13. Risk Escalation Matrix & Unified Scale",
      category: "Decision Support",
      route: "/app/alert-center",
      icon: ShieldAlert,
      desc: "Unified 0–100 risk scale: 0-20 (Very Low / Green), 21-40 (Low / Green), 41-60 (Moderate / Yellow), 61-80 (High / Orange), 81-100 (Critical / Red).",
      highlight: "Probability × Impact decision matrix.",
    },
    {
      id: 14,
      title: "14. Critical RED ALERT System",
      category: "Early Warning",
      route: "/app/alert-center",
      icon: Siren,
      desc: "Instant high-priority banner and multi-channel CAP trigger when risk crosses the 80/100 critical threshold with official actionable safety guidance.",
      highlight: "Never claims disaster is 100% guaranteed.",
    },
    {
      id: 15,
      title: "15. Citizen Hazard Reporting ('Report a Hazard')",
      category: "Community Resiliency",
      route: "/app/incidents",
      icon: HelpCircle,
      desc: "Citizens submit geo-tagged hazard reports (Landslide, Road Crack, Rockfall, Flood, Fallen Tree, Damaged Bridge) with photos and GPS.",
      highlight: "Citizen → AI Validation → Authority Verification workflow.",
    },
    {
      id: 16,
      title: "16. Authority Command Center & Incident Verification",
      category: "Operations & SDRF",
      route: "/app/authority",
      icon: Crown,
      desc: "Dedicated command interface for District Magistrates, SDRF, and NDMA to verify citizen reports, issue CAP alerts, and coordinate relief shelters.",
      highlight: "Role-based access control (RBAC) ensuring citizen safety.",
    },
    {
      id: 17,
      title: "17. Side-by-Side Location Comparison",
      category: "Comparative Analytics",
      route: "/app/compare?a=Shillong&b=Gangtok",
      icon: Scale,
      desc: "Multi-dimensional radar charts and comparative bar graphs comparing Shillong vs Gangtok across Landslide, Flood, Earthquake, Rainfall, and Elevation.",
      highlight: "Enables regional disaster prioritization.",
    },
    {
      id: 18,
      title: "18. Official AI Disaster Risk Assessment PDF Report",
      category: "Executive Reporting",
      route: "/app/reports",
      icon: FileSpreadsheet,
      desc: "One-click generation of comprehensive, downloadable, print-ready PDF disaster risk assessment reports with maps, charts, disclaimers, and recommendations.",
      highlight: "Official executive documentation for authorities and researchers.",
    },
  ];

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const goToStep = (idx) => {
    if (idx >= 0 && idx < STEPS.length) {
      setCurrentStep(idx);
      navigate(STEPS[idx].route);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 sm:w-full sm:max-w-lg bg-slate-900/95 border border-emerald-500/50 rounded-3xl p-4 sm:p-5 text-slate-100 shadow-2xl backdrop-blur-xl animate-fade-in font-sans">
      {/* Glow Effect */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
              Bhu-Surakha · Presentation Tour
            </span>
            <span className="text-xs font-bold text-slate-200">
              Sequence {currentStep + 1} of {STEPS.length}: {step.category}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          title="Exit Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="py-3 space-y-2.5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/50 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-black text-white">{step.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-emerald-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span><strong>Judge Highlight:</strong> {step.highlight}</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep === STEPS.length - 1}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-400 ml-1">
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToStep(0)}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restart</span>
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => goToStep(currentStep + 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30 transition flex items-center gap-1.5"
            >
              <span>Next Feature</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
