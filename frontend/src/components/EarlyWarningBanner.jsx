import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, X, ArrowRight, Bell, AlertTriangle,
  Mountain, Waves, Activity, CloudRain
} from "lucide-react";
import { get } from "../api";

const HAZARD_ICONS = {
  landslide: Mountain,
  flood: Waves,
  earthquake: Activity,
  rainfall: CloudRain,
};

const LEVEL_STYLES = {
  Emergency: {
    wrapper: "bg-gradient-to-r from-red-700 to-rose-800 border-red-400/60",
    badge: "bg-red-900/80 border-red-300/40 text-red-100",
    text: "text-red-100",
    title: "text-white",
    btn: "bg-white text-red-900 hover:bg-red-50",
    pulse: true,
  },
  Warning: {
    wrapper: "bg-gradient-to-r from-orange-600 to-amber-600 border-orange-300/50",
    badge: "bg-orange-900/60 border-orange-200/40 text-orange-100",
    text: "text-orange-100",
    title: "text-white",
    btn: "bg-white text-orange-900 hover:bg-orange-50",
    pulse: false,
  },
  Advisory: {
    wrapper: "bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-300/50",
    badge: "bg-amber-900/40 border-amber-200/40 text-amber-900",
    text: "text-amber-900",
    title: "text-amber-950",
    btn: "bg-amber-950 text-white hover:bg-amber-900",
    pulse: false,
  },
};

/**
 * EarlyWarningBanner — shows a dismissable top-of-page banner for active alerts.
 * Pass `score` and `level` props to render inline (e.g., inside LocationAnalysis),
 * or leave them empty to auto-fetch the top active alert from the API.
 */
export default function EarlyWarningBanner({
  score = null,
  level = null,
  locationName = null,
  hazard = null,
  reason = null,
  onDismiss = null,
  autoFetch = false,
}) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (autoFetch && !score) {
      get("/api/alerts/?active_only=true")
        .then((rows) => {
          if (Array.isArray(rows) && rows.length > 0) {
            const top = rows.sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))[0];
            setAlert(top);
          }
        })
        .catch(() => {});
    }
  }, [autoFetch]);

  const resolvedLevel = level ?? alert?.level ?? null;
  const resolvedScore = score ?? alert?.risk_score ?? null;
  const resolvedName = locationName ?? alert?.location ?? null;
  const resolvedHazard = hazard ?? "landslide";
  const resolvedReason = reason ?? alert?.message ?? null;

  if (!resolvedLevel || dismissed) return null;

  const st = LEVEL_STYLES[resolvedLevel] ?? LEVEL_STYLES.Warning;
  const HazardIcon = HAZARD_ICONS[resolvedHazard.toLowerCase()] ?? ShieldAlert;

  const dismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`relative rounded-2xl border-2 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl ${st.wrapper} ${st.pulse ? "animate-pulse" : ""}`}>
      {/* Left: Icon + Content */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-black/30 shrink-0">
          <HazardIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${st.badge}`}>
              {resolvedLevel === "Emergency" ? "🔴" : resolvedLevel === "Warning" ? "🟠" : "🟡"} {resolvedLevel?.toUpperCase()}
            </span>
            {resolvedScore != null && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-black/30 ${st.text} border border-white/20`}>
                Risk: {resolvedScore}/100
              </span>
            )}
          </div>
          <p className={`font-black text-sm ${st.title}`}>
            {resolvedLevel === "Emergency" ? "CRITICAL MULTI-HAZARD ALERT" : `EARLY WARNING — ${resolvedLevel?.toUpperCase()}`}
            {resolvedName ? ` — ${resolvedName}` : ""}
          </p>
          {resolvedReason && (
            <p className={`text-xs mt-0.5 leading-relaxed ${st.text}`}>{resolvedReason}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {resolvedName && (
          <button
            onClick={() => navigate(`/app/analyze?q=${encodeURIComponent(resolvedName)}`)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md ${st.btn}`}
          >
            <Bell className="w-3.5 h-3.5" /> View Analysis
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => navigate("/app/alert-center")}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition bg-black/30 text-white hover:bg-black/40 border border-white/20`}
        >
          Alert Centre
        </button>
        <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-black/20 transition text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * GlobalWarningBar — auto-fetches top alert and sticks to top of any page.
 * Import and use inside Layout.jsx or Dashboard.jsx.
 */
export function GlobalWarningBar() {
  const navigate = useNavigate();
  const [topAlert, setTopAlert] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    get("/api/alerts/?active_only=true")
      .then((rows) => {
        if (Array.isArray(rows) && rows.length > 0) {
          const critical = rows
            .filter((r) => r.level === "Emergency" || (r.risk_score ?? 0) >= 70)
            .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))[0];
          if (critical) setTopAlert(critical);
        }
      })
      .catch(() => {});
  }, []);

  if (!topAlert || dismissed) return null;

  return (
    <div className="bg-red-700 text-white text-xs font-bold px-4 py-2 flex items-center justify-between gap-3 border-b border-red-500">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldAlert className="w-4 h-4 shrink-0 text-red-200 animate-pulse" />
        <span className="truncate">
          🔴 <strong>{topAlert.level?.toUpperCase()}</strong> — {topAlert.title} · Risk: {topAlert.risk_score}/100
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate("/app/alert-center")}
          className="text-[11px] font-black bg-white text-red-900 px-2.5 py-1 rounded-lg hover:bg-red-50 transition"
        >
          View Alerts
        </button>
        <button onClick={() => setDismissed(true)} className="hover:text-red-200 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
