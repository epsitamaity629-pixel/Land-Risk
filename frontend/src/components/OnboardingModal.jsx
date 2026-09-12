import { useState, useEffect } from "react";
import {
  Shield,
  MapPin,
  Globe,
  Sparkles,
  Mountain,
  Waves,
  Activity,
  CloudRain,
  Flame,
  Wind,
  CheckCircle2,
  ArrowRight,
  X
} from "lucide-react";
import { useAuth } from "../AuthContext";

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const { lang, switchLang, addSavedLocation } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("Shillong, Meghalaya");
  const [selectedLanguage, setSelectedLanguage] = useState(lang || "en");
  const [selectedHazards, setSelectedHazards] = useState([
    "Landslide",
    "Flood",
    "Extreme Rainfall",
    "Earthquake",
  ]);

  const HAZARD_OPTIONS = [
    { id: "Landslide", label: "Landslide & Slope Risk", icon: Mountain, desc: "Rainfall thresholds, slope angles & soil moisture" },
    { id: "Flood", label: "Flood & Flash Inundation", icon: Waves, desc: "River basins, discharge rates & floodplain exposure" },
    { id: "Extreme Rainfall", label: "Extreme Rainfall & Cloudburst", icon: CloudRain, desc: "IMD telemetry, 24h & 7-day accumulation" },
    { id: "Earthquake", label: "Earthquake & Seismic Activity", icon: Activity, desc: "BIS IS 1893 zones & historical epicenters" },
    { id: "Cyclone", label: "Cyclone & Storm Surge", icon: Wind, desc: "Wind velocity & coastal/inland depression tracks" },
    { id: "Heatwave", label: "Heatwave & Thermal Stress", icon: Flame, desc: "Extreme temperature anomalies & drought risk" },
  ];

  const POPULAR_LOCATIONS = [
    "Shillong, Meghalaya",
    "Gangtok, Sikkim",
    "Guwahati, Assam",
    "Darjeeling, West Bengal",
    "Aizawl, Mizoram",
    "Kohima, Nagaland",
    "Itanagar, Arunachal Pradesh",
    "Imphal, Manipur",
    "Dehradun, Uttarakhand",
    "Kedarnath, Uttarakhand",
    "Shimla, Himachal Pradesh",
    "Munnar, Kerala",
  ];

  const toggleHazard = (hazardId) => {
    if (selectedHazards.includes(hazardId)) {
      if (selectedHazards.length > 1) {
        setSelectedHazards(selectedHazards.filter((h) => h !== hazardId));
      }
    } else {
      setSelectedHazards([...selectedHazards, hazardId]);
    }
  };

  const handleFinish = () => {
    if (switchLang && selectedLanguage !== lang) {
      switchLang(selectedLanguage);
    }
    if (addSavedLocation && selectedLocation) {
      addSavedLocation({
        name: selectedLocation.split(",")[0].trim(),
        category: "Home",
        state: selectedLocation.split(",")[1]?.trim() || "NER",
        alertsEnabled: true,
      });
    }
    try {
      localStorage.setItem("bhusurakha_onboarded", "true");
    } catch (e) {}
    if (onComplete) onComplete({ selectedLocation, selectedLanguage, selectedHazards });
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 text-slate-900 shadow-2xl space-y-5 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 sm:right-5 top-4 sm:top-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Welcome to Bhu-Surakha</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Personalize Your Multi-Hazard Command Center
          </h2>
          <p className="text-xs text-slate-500">
            Configure your primary monitoring coordinates, preferred language, and hazard intelligence priorities.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                step >= s ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">1. Select Your Primary Monitoring Location</h3>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Enter city, town, hill station, or district..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />

              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  Popular NER & Pan-India Hotspots:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                        selectedLocation === loc
                          ? "bg-emerald-700 text-white font-bold shadow-2xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>Next: Language</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Language Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">2. Choose Your Preferred Language</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { code: "en", name: "English", native: "English" },
                { code: "bn", name: "Bengali", native: "বাংলা" },
                { code: "as", name: "Assamese", native: "অসমীয়া" },
                { code: "hi", name: "Hindi", native: "हिंदी" },
                { code: "ne", name: "Nepali", native: "नेपाली" },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLanguage(l.code)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedLanguage === l.code
                      ? "bg-emerald-50 border-emerald-400 text-slate-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-base font-bold text-slate-900">{l.native}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{l.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>Next: Hazard Priorities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interested Hazards */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">3. Select Hazards You Want to Monitor</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {HAZARD_OPTIONS.map((hz) => {
                const Icon = hz.icon;
                const isSelected = selectedHazards.includes(hz.id);
                return (
                  <button
                    key={hz.id}
                    type="button"
                    onClick={() => toggleHazard(hz.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-300 text-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-emerald-600 text-white font-bold" : "bg-slate-200 text-slate-600"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{hz.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{hz.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Bhu-Surakha Platform</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
