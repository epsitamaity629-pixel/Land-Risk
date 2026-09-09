import { useEffect, useState } from "react";
import {
  Bell,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  Shield,
  Clock,
  Layers
} from "lucide-react";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

const CHANNELS = ["SMS Gateway", "WhatsApp Alert", "CAP Push Broadcast", "Email Notification", "Web Banner"];

export default function Alerts() {
  const { t } = useAuth();
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [picked, setPicked] = useState(["SMS Gateway", "WhatsApp Alert", "CAP Push Broadcast"]);
  const [receipt, setReceipt] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  const load = () => get("/api/alerts/").then(setRows).catch(console.error);

  useEffect(() => {
    load();
    window.addEventListener("ner-sim-tick", load);
    return () => window.removeEventListener("ner-sim-tick", load);
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

  const getBadgeStyle = (level) => {
    if (level === "Emergency" || level === "Critical") return "bg-red-50 text-red-700 border-red-200";
    if (level === "Warning" || level === "High") return "bg-orange-50 text-orange-700 border-orange-200";
    if (level === "Advisory" || level === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span>Multi-Channel Early Warning Broadcasting System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.alerts} & Public Warning Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated threshold trigger dispatch to District Administrations, NDRF Battalions, and Local Citizens.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>CAP Cell-Broadcast Gateway Ready</span>
        </div>
      </div>

      {/* Alert Cards Stream */}
      <div className="space-y-3">
        {rows.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
          >
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(a.level)}`}>
                  {a.level}
                </span>
                <span className="font-bold text-slate-900 text-sm">{a.title}</span>
                {a.location && (
                  <span className="text-xs text-slate-500 font-semibold">
                    · {a.location} ({a.state})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{a.message}</p>
              {a.recommended_actions && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-100 mt-1 font-medium">
                  <strong>Directive:</strong> {a.recommended_actions}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setModal(a);
                setReceipt(null);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Warning</span>
            </button>
          </div>
        ))}
      </div>

      {/* Dispatch Simulation Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[3000] flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Broadcast Simulation</span>
                <h3 className="font-bold text-slate-900 text-base">{modal.title}</h3>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Target Message Body:</span>
              <p>{modal.message}</p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">Select Active Broadcast Channels:</span>
              <div className="grid sm:grid-cols-2 gap-2">
                {CHANNELS.map((c) => (
                  <label
                    key={c}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                      picked.includes(c)
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={picked.includes(c)}
                      onChange={() =>
                        setPicked((p) =>
                          p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
                        )
                      }
                      className="rounded text-emerald-700 focus:ring-0"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={dispatch}
              disabled={dispatching || picked.length === 0}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {dispatching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Radio className="w-4 h-4" />
              )}
              <span>Execute Cell-Broadcast Transmission</span>
            </button>

            {receipt && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transmission Confirmed via Cell Broadcast & SMS Tower</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-700 divide-y divide-emerald-100">
                  {receipt.receipts.map((r) => (
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
