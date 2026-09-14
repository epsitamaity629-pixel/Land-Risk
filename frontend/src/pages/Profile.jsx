import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Shield,
  MapPin,
  Bell,
  Globe,
  Smartphone,
  Mail,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Mountain,
  Waves,
  Activity,
  CloudRain,
  Flame,
  Wind
} from "lucide-react";
import { useAuth } from "../AuthContext";

export default function Profile() {
  const { user, role, lang, switchLang, savedLocations, addSavedLocation, removeSavedLocation } = useAuth();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [newLocName, setNewLocName] = useState("");
  const [newLocCategory, setNewLocCategory] = useState("Home");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    redAlerts: true,
    orangeWarnings: true,
    landslideRisk: true,
    floodRisk: true,
    earthquakeAdvisory: true,
    smsDispatches: false,
    emailBriefing: true,
  });

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    addSavedLocation({
      id: Date.now(),
      name: newLocName.trim(),
      category: newLocCategory,
      state: "NER / Pan-India",
      alertsEnabled: true,
    });
    setNewLocName("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-950/50">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{user?.full_name || user?.username || "Authenticated User"}</h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email || "user@bhu-surakha.gov.in"}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Disaster Intelligence Profile · Active Node</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              My Dashboard
            </Link>
            <Link
              to="/app/analyze"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Risk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          ["overview", "Profile Overview", User],
          ["saved_places", `Saved Places (${savedLocations?.length || 0})`, MapPin],
          ["notifications", "Early Warning Subscriptions", Bell],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === key
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Profile Overview */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>User Credentials & Account Metadata</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Full Name</span>
                <span className="font-bold text-slate-800">{user?.full_name || "Disaster Intelligence Officer"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Email ID</span>
                <span className="font-bold text-slate-800">{user?.email || "user@bhu-surakha.gov.in"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Assigned Role</span>
                <span className="font-bold text-slate-800">{role}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Organization / Directorate</span>
                <span className="font-bold text-slate-800">{user?.organization || "Disaster Management Cell"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Active Language Setting</span>
                <span className="font-bold text-slate-800 uppercase">{lang}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Geographic Focus & Hazard Preferences</span>
            </h2>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Your profile is subscribed to multi-hazard early warning feeds across 8 North Eastern States and national disaster monitoring corridors.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  ["Landslide Intelligence", Mountain, "Active"],
                  ["Flood Intelligence", Waves, "Active"],
                  ["Seismic / Earthquake", Activity, "Active"],
                  ["Extreme Rainfall", CloudRain, "Active"],
                ].map(([name, Icon, status]) => (
                  <div key={name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">{name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Saved Places */}
      {activeTab === "saved_places" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>My Saved Places & Monitoring Hotspots</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save important locations (Home, College, Family, Travel) to receive automated multi-hazard risk alerts.
                </p>
              </div>

              {savedSuccess && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Location Saved!</span>
                </div>
              )}
            </div>

            {/* Add New Saved Location Form */}
            <form onSubmit={handleAddLocation} className="flex flex-col sm:flex-row gap-2 mb-6">
              <input
                type="text"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="e.g. Shillong, Gangtok, Guwahati, Darjeeling, Kedarnath..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                required
              />
              <select
                value={newLocCategory}
                onChange={(e) => setNewLocCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="Home">🏡 Home Location</option>
                <option value="College">🎓 College / University</option>
                <option value="Family">👨‍👩‍👧 Family Location</option>
                <option value="Travel">✈️ Travel Destination</option>
                <option value="Work">🏢 Work / Office</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Place</span>
              </button>
            </form>

            {/* Saved Locations List */}
            {savedLocations && savedLocations.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedLocations.map((loc) => (
                  <div
                    key={loc.id || loc.name}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                          {loc.category || "Saved Place"}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 mt-1">{loc.name}</h3>
                        <p className="text-[11px] text-slate-500">{loc.state || "NER Region"}</p>
                      </div>
                      <button
                        onClick={() => removeSavedLocation(loc.name)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition"
                        title="Remove Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Risk Monitored</span>
                      </span>
                      <Link
                        to={`/app/analyze?q=${encodeURIComponent(loc.name)}`}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No saved locations yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Save your home, college, or travel destinations above to get instant risk alerts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Notifications & Subscriptions */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Multi-Hazard Early Warning Alert Subscriptions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control which severity tiers and hazard types trigger instant push notifications and alerts.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              ["redAlerts", "Critical RED ALERTS (Risk Score ≥ 80)", "Immediate evacuation triggers and extreme imminent disaster risk notifications."],
              ["orangeWarnings", "ORANGE WARNINGS (Risk Score 61–79)", "High disaster risk alerts requiring active preparedness."],
              ["landslideRisk", "Landslide & Slope Instability Feeds", "Rainfall threshold exceedances, pore pressure surges, and road blockages."],
              ["floodRisk", "Flash Flood & River Basin Feeds", "CWC river level surges, discharge rate anomalies, and inundation warnings."],
              ["earthquakeAdvisory", "Earthquake & Seismic Activity Bulletins", "BIS IS 1893 seismic zone updates and significant regional earthquake event notices."],
              ["emailBriefing", "Daily Executive Weather & Risk Digest", "Morning situational report for your monitored regions."],
            ].map(([key, title, desc]) => (
              <div key={key} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification(key)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 cursor-pointer ${
                    notifications[key] ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
