import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Radio, Send, CheckCircle2, AlertTriangle, Smartphone,
  Mail, Shield, Clock, ShieldAlert, Activity, MapPin, TrendingUp,
  Eye, Zap, Filter, RefreshCw, ArrowRight, Layers, Info
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

const CHANNELS = ["SMS Gateway", "WhatsApp Alert", "CAP Push Broadcast", "Email Notification", "Web Banner"];

const LEVEL_CONFIG = {
  Emergency: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", badge: "bg-red-600 text-white", dot: "bg-red-600", icon: "🔴" },
  Warning: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-500 text-white", dot: "bg-orange-500", icon: "🟠" },
  Advisory: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-400 text-black", dot: "bg-amber-400", icon: "🟡" },
  Info: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-600 text-white", dot: "bg-emerald-500", icon: "🟢" },
};

const getLevelConfig = (level) => {
  if (!level) return LEVEL_CONFIG.Info;
  if (level.toLowerCase().includes("emerg") || level.toLowerCase().includes("crit")) return LEVEL_CONFIG.Emergency;
  if (level.toLowerCase().includes("warn")) return LEVEL_CONFIG.Warning;
  if (level.toLowerCase().includes("advis")) return LEVEL_CONFIG.Advisory;
  return LEVEL_CONFIG.Info;
};

// ─── Escalation Timeline visual ────────────────────────────────────────────
function EscalationFlow({ level }) {
  const steps = [
    { label: "Threshold Breach", icon: Activity, done: true },
    { label: "AI Calculates Risk", icon: Zap, done: true },
    { label: "District Authority Alert", icon: Shield, done: level !== "Info" },
    { label: "Emergency Escalation", icon: ShieldAlert, done: level === "Emergency" || level === "Warning" },
    { label: "Citizen Broadcast", icon: Smartphone, done: level === "Emergency" },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap mt-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${s.done ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              <Icon className="w-3 h-3" />
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
          </div>
        );
      })}
    </div>
  );
}

export default function AlertCenter() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [picked, setPicked] = useState(["SMS Gateway", "WhatsApp Alert", "CAP Push Broadcast"]);
  const [receipt, setReceipt] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await get("/api/alerts/?active_only=false");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    window.addEventListener("ner-sim-tick", () => load(true));
    return () => {
      clearInterval(interval);
      window.removeEventListener("ner-sim-tick", () => load(true));
    };
  }, []);

  const dispatch = async () => {
    if (!modal) return;
    setDispatching(true);
    try {
      const r = await post("/api/alerts/dispatch", { alert_id: modal.id, channels: picked });
      setReceipt(r);
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  const ackAlert = async (id) => {
    try {
      await post(`/api/alerts/ack/${id}`, {});
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRows = rows.filter((a) => {
    if (filter === "all") return true;
    if (filter === "critical") return a.level === "Emergency" || (a.risk_score ?? 0) >= 75;
    if (filter === "warning") return a.level === "Warning";
    if (filter === "active") return a.is_active !== false;
    return true;
  });

  // KPI counts
  const counts = {
    total: rows.length,
    critical: rows.filter((r) => r.level === "Emergency" || (r.risk_score ?? 0) >= 75).length,
    warning: rows.filter((r) => r.level === "Warning").length,
    active: rows.filter((r) => r.is_active !== false).length,
  };

  // For trend chart — mock last 7 days
  const trendData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
    day: d,
    alerts: Math.max(1, counts.total - (6 - i) + Math.round(Math.random() * 3 - 1)),
    critical: Math.max(0, counts.critical - Math.round(Math.random() * 2)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>National Disaster Alert Centre · Multi-Channel Broadcasting</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Early Warning Alert Centre</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            CAP-compliant automated threshold-trigger dispatch to District Administrations, NDRF Battalions & Citizens.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs font-bold">
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            <span>CAP Gateway Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Alerts", val: counts.total, icon: Bell, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "🔴 Critical", val: counts.critical, icon: ShieldAlert, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "🟠 Warning", val: counts.warning, icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "Active Now", val: counts.active, icon: Activity, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`p-4 rounded-2xl border ${k.bg} ${k.border} flex items-center gap-3`}>
              <div className={`p-2 rounded-xl bg-white border ${k.border}`}>
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{k.label}</span>
                <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Trend Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-3">Alert Activity — Last 7 Days</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, color: "#fff", fontSize: 11 }} />
              <Area type="monotone" dataKey="alerts" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} name="Total Alerts" />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} name="Critical" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & Alert Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-900">Active Warning Stream</h2>
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            {["all", "critical", "warning", "active"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg border font-bold transition ${filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {f === "all" ? "All" : f === "critical" ? "🔴 Critical" : f === "warning" ? "🟠 Warning" : "Active"}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRows.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No alerts match this filter.</p>
            </div>
          ) : (
            filteredRows.map((a) => {
              const lc = getLevelConfig(a.level);
              return (
                <div key={a.id} className={`p-4 hover:bg-slate-50 transition`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${lc.badge}`}>
                          {lc.icon} {a.level}
                        </span>
                        <span className="font-bold text-slate-900 text-sm truncate">{a.title}</span>
                        {a.location && (
                          <span className="text-xs text-slate-500 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />{a.location}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>

                      {/* Escalation Flow */}
                      <EscalationFlow level={a.level} />

                      {a.recommended_actions && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-900 font-medium">
                          <strong>Directive:</strong> {a.recommended_actions}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {a.risk_score != null && (
                        <div className={`text-center px-3 py-1.5 rounded-xl border ${lc.bg} ${lc.border}`}>
                          <span className={`text-xl font-black ${lc.text}`}>{a.risk_score}</span>
                          <span className="text-[10px] text-slate-500 block">/ 100</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => { setModal(a); setReceipt(null); }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1">
                          <Send className="w-3 h-3" /> Dispatch
                        </button>
                        <button onClick={() => navigate(`/app/analyze?q=${a.location ?? ""}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Analyze
                        </button>
                        {a.is_active !== false && (
                          <button onClick={() => ackAlert(a.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-lg transition flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ack
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recently Escalated Areas */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">Quick Alert Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { icon: "🔴", label: "Shillong, Meghalaya", risk: "Landslide", level: "Critical" },
            { icon: "🔴", label: "Assam (Brahmaputra)", risk: "Flood", level: "Critical" },
            { icon: "🟠", label: "Sikkim (Teesta)", risk: "Landslide", level: "Warning" },
            { icon: "🟠", label: "Arunachal Pradesh", risk: "Heavy Rainfall", level: "Warning" },
            { icon: "🟡", label: "Meghalaya (NH-6)", risk: "Flash Flood Watch", level: "Advisory" },
            { icon: "🟡", label: "Darjeeling, WB", risk: "Landslide Watch", level: "Advisory" },
          ].map((a, i) => {
            const lc = getLevelConfig(a.level);
            return (
              <button key={i} onClick={() => navigate(`/app/analyze?q=${a.label.split(",")[0]}`)}
                className={`p-3 rounded-xl border text-left hover:shadow-md transition ${lc.bg} ${lc.border}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{a.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 block truncate">{a.label}</span>
                    <span className={`text-[10px] font-bold ${lc.text}`}>{a.risk}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dispatch Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4" onClick={() => { setModal(null); setReceipt(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-red-700 uppercase block">Emergency Broadcast Simulation</span>
                <h3 className="font-black text-slate-900 text-base">{modal.title}</h3>
              </div>
              <button onClick={() => { setModal(null); setReceipt(null); }} className="text-slate-400 hover:text-slate-600 text-sm font-black">✕</button>
            </div>

            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Broadcast Message:</span>
              <p className="leading-relaxed">{modal.message}</p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">Select Broadcast Channels:</span>
              <div className="grid sm:grid-cols-2 gap-2">
                {CHANNELS.map((c) => (
                  <label key={c} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${picked.includes(c) ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                    <input type="checkbox" checked={picked.includes(c)}
                      onChange={() => setPicked((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])}
                      className="rounded text-emerald-700 focus:ring-0" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={dispatch} disabled={dispatching || picked.length === 0}
              className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-black text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
              {dispatching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Radio className="w-4 h-4" />}
              Execute Cell-Broadcast Transmission
            </button>

            {receipt && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Transmission Confirmed
                </div>
                <ul className="space-y-1 text-[11px] text-slate-700 divide-y divide-emerald-100">
                  {(receipt.receipts || []).map((r) => (
                    <li key={r.channel} className="pt-1 flex justify-between">
                      <span className="font-semibold text-slate-900">{r.channel}:</span>
                      <span className="text-emerald-700 font-medium">{r.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
