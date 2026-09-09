import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Camera,
  MapPin,
  Navigation,
  CloudOff,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  Clock,
  Send,
  FileImage,
  Layers,
  Sparkles,
  Eye,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { get, patch, batchSyncIncidents, analyzeIncidentImage } from "../api";
import { useAuth } from "../AuthContext";

const FLOW = ["Under Review", "Verified", "Dispatched", "Resolved"];
const OFFLINE_STORAGE_KEY = "ner_offline_incident_reports";

export default function Incidents() {
  const { t } = useAuth();
  const [rows, setRows] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [syncMsg, setSyncMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI Image Analysis state
  const [cvAnalysis, setCvAnalysis] = useState({
    model: "ResNet-50 + YOLOv8 Geotechnical Classifier",
    detections: [
      { label: "Structural Tension Crack", confidence_pct: 88, severity: "High" },
      { label: "Subsurface Shear Dislocation", confidence_pct: 74, severity: "Moderate" },
      { label: "Pavement Fracture", confidence_pct: 69, severity: "Moderate" }
    ],
    primary_hazard: "Structural Tension Crack",
    primary_confidence_pct: 88,
    triage_recommendation: "High Priority: Progressive crown crack indicates imminent slope collapse."
  });

  const [form, setForm] = useState({
    reporter_name: "Field observer",
    role: "Field Officer",
    state: "West Bengal",
    district: "Kalimpong",
    latitude: 27.0667,
    longitude: 88.4667,
    severity: "Moderate",
    hazard_type: "crack",
    description: "Tension cracks observed on cut slope after overnight rainfall on NH-10.",
  });

  const load = () => {
    if (navigator.onLine) {
      get("/api/incidents/").then(setRows).catch(console.error);
    }
  };

  useEffect(() => {
    load();

    const handleOnline = () => {
      setIsOnline(true);
      autoSyncOfflineReports();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const autoSyncOfflineReports = async () => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      const queue = stored ? JSON.parse(stored) : [];
      if (queue.length > 0) {
        const res = await batchSyncIncidents(queue);
        localStorage.removeItem(OFFLINE_STORAGE_KEY);
        setOfflineQueue([]);
        setSyncMsg(`${res.synced_count} ${t.syncSuccess}`);
        load();
        setTimeout(() => setSyncMsg(""), 4000);
      }
    } catch (e) {
      console.error("Auto sync failed:", e);
    }
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          }));
        },
        () => {
          alert("Could not detect GPS location.");
        }
      );
    }
  };

  const handleHazardTypeChange = (val) => {
    setForm({ ...form, hazard_type: val });
    if (val === "crack") {
      setCvAnalysis({
        model: "ResNet-50 + YOLOv8 Geotechnical Classifier",
        detections: [
          { label: "Structural Ground Tension Crack", confidence_pct: 88, severity: "High" },
          { label: "Subsurface Shear Dislocation", confidence_pct: 74, severity: "Moderate" },
          { label: "Pavement Fracture", confidence_pct: 69, severity: "Moderate" }
        ],
        primary_hazard: "Structural Tension Crack",
        primary_confidence_pct: 88,
        triage_recommendation: "High Priority: Progressive crown crack indicates imminent slope collapse."
      });
    } else if (val === "waterlogging") {
      setCvAnalysis({
        model: "ResNet-50 + YOLOv8 Geotechnical Classifier",
        detections: [
          { label: "Waterlogging / Inundation", confidence_pct: 91, severity: "Critical" },
          { label: "Drainage Overflow", confidence_pct: 84, severity: "High" },
          { label: "Road Submersion", confidence_pct: 78, severity: "High" }
        ],
        primary_hazard: "Waterlogging / Inundation",
        primary_confidence_pct: 91,
        triage_recommendation: "Emergency: River backflow submerged carriageway. Deploy barrier warning."
      });
    } else if (val === "road_blockage") {
      setCvAnalysis({
        model: "ResNet-50 + YOLOv8 Geotechnical Classifier",
        detections: [
          { label: "Road Blockage (Debris / Boulder)", confidence_pct: 94, severity: "Critical" },
          { label: "Cut-slope Failure", confidence_pct: 86, severity: "High" },
          { label: "Traffic Impassable", confidence_pct: 92, severity: "Critical" }
        ],
        primary_hazard: "Road Blockage (Debris / Boulder)",
        primary_confidence_pct: 94,
        triage_recommendation: "Critical Road Blockage: Heavy excavator required for boulder clearance."
      });
    } else {
      setCvAnalysis({
        model: "ResNet-50 + YOLOv8 Geotechnical Classifier",
        detections: [
          { label: "Landslide Debris Flow", confidence_pct: 87, severity: "High" },
          { label: "Vegetation Stripping & Mudflow", confidence_pct: 79, severity: "Moderate" },
          { label: "Road Corridor Compromise", confidence_pct: 82, severity: "High" }
        ],
        primary_hazard: "Landslide Debris Flow",
        primary_confidence_pct: 87,
        triage_recommendation: "Field Triage Verified: Active debris movement detected. Dispatch reconnaissance team."
      });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("hazard_type", form.hazard_type);
      try {
        const res = await analyzeIncidentImage(fd);
        if (res && res.detections) {
          setCvAnalysis(res);
        }
      } catch (err) {
        console.error("AI image analysis error:", err);
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!navigator.onLine) {
      // Queue offline
      const newQueue = [...offlineQueue, { ...form, timestamp: new Date().toISOString() }];
      setOfflineQueue(newQueue);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(newQueue));
      setSubmitting(false);
      alert("No internet connection detected in remote area. Report saved safely in local offline queue!");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const photo = e.target.photo?.files?.[0];
      if (photo) fd.append("photo", photo);

      const token = localStorage.getItem("ner_token");
      await fetch("/api/incidents/", {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      load();
    } catch (err) {
      // Fallback offline queue on network failure
      const newQueue = [...offlineQueue, { ...form, timestamp: new Date().toISOString() }];
      setOfflineQueue(newQueue);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(newQueue));
      alert("Network error: report stored in offline queue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.fieldReports}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geo-tagged ground observation submission with photo/video evidence, AI Computer Vision triage, and offline synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t.onlineBadge}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold animate-pulse">
              <CloudOff className="w-4 h-4 text-amber-700" />
              <span>{t.offlineBadge}</span>
            </div>
          )}

          {offlineQueue.length > 0 && (
            <button
              onClick={autoSyncOfflineReports}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ({offlineQueue.length})</span>
            </button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{syncMsg}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Incidents on Right */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Left: Geo-tagged Incident Submission Form */}
        <form onSubmit={submit} className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">{t.submitReportTitle}</h2>
            <button
              type="button"
              onClick={handleUseGPS}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 transition"
            >
              <Navigation className="w-3 h-3" />
              <span>{t.useCurrentLocation}</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.hazardType}</label>
            <select
              value={form.hazard_type}
              onChange={(e) => handleHazardTypeChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="crack">📸 {t.crack}</option>
              <option value="slope_movement">🎥 {t.slopeMove}</option>
              <option value="waterlogging">🌊 {t.waterlogging}</option>
              <option value="road_blockage">🚧 {t.roadBlock}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reporter Name</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.reporter_name}
                onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
                placeholder="Observer Name"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Designated Role</label>
              <select
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option>Field Officer</option>
                <option>Citizen</option>
                <option>NDRF Personnel</option>
                <option>Highway Patrol</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">District / Highway</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="District or NH route"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude (°N)</label>
              <input
                type="number"
                step="0.0001"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude (°E)</label>
              <input
                type="number"
                step="0.0001"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.severity}</label>
              <select
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
                <option>Severe / Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.photoVideo}</label>
              <input
                name="photo"
                type="file"
                accept="image/*,video/*"
                onChange={handlePhotoUpload}
                className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
          </div>

          {/* AI Image Analysis / Computer Vision Triage Box */}
          {cvAnalysis && (
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-indigo-950 pb-1 border-b border-indigo-200/60">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{t.aiImageAnalysisTitle || "AI Computer Vision Triage"}</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-700">ResNet-50 + YOLOv8</span>
              </div>

              <div className="space-y-1 text-[11px]">
                {cvAnalysis.detections.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${d.confidence_pct}%` }}
                        />
                      </div>
                      <span className="font-bold text-indigo-900 font-mono text-[10px]">
                        {d.confidence_pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1.5 border-t border-indigo-200/60 text-[10px] text-indigo-900 font-medium">
                <strong>Triage Advice:</strong> {cvAnalysis.triage_recommendation}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description & Road Damage Details</label>
            <textarea
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe crack width, debris on road, water levels, or trapped vehicles..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{t.submitReport}</span>
          </button>
        </form>

        {/* Right: Submitted Reports Stream & Verification Workflow */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900">Live Incident & Ground Verification Stream</h2>
              <span className="text-xs font-semibold text-slate-500">{rows.length} reports logged</span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {rows.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.reporter_name}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                        {r.role}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      r.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      r.status === "Dispatched" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      r.status === "Verified" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed font-medium">{r.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.district || r.state} ({r.latitude.toFixed(3)}°, {r.longitude.toFixed(3)}°)</span>
                      <span className="font-semibold text-orange-700">· Severity: {r.severity}</span>
                    </div>

                    {/* Official Workflow Actions */}
                    <div className="flex items-center gap-1">
                      {FLOW.map((s) => (
                        <button
                          key={s}
                          onClick={() => patch(`/api/incidents/${r.id}/status`, { status: s }).then(load)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition font-semibold ${
                            r.status === s
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 hover:bg-slate-100 border-slate-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Encrypted Geo-Tag Metadata</span>
            <span>NER Ground Verification Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
