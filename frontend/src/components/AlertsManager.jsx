import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Send,
  Radio,
  Smartphone,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Share2
} from "lucide-react";
import { api } from "../services/api";

export default function AlertsManager({ activeAlerts, onRefresh }) {
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulateDispatch = async (alert) => {
    setSimulating(true);
    try {
      const res = await api.dispatchSimulation({
        alert_code: alert.alert_code,
        state: alert.state
      });
      setDispatchStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Automated Early Warning & Multi-Channel Alert Engine
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Instant multi-modal emergency broadcasting (SMS, Cell Broadcast, Email, and Push Notifications) for North Eastern communities.
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5 animate-pulse">
          <Radio className="h-3.5 w-3.5" />
          {activeAlerts.length} Active Early Warnings
        </span>
      </div>

      {/* Dispatched Simulation Confirmation Modal / Card */}
      {dispatchStatus && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              EMERGENCY BROADCAST SIMULATOR: DISPATCH SUCCESSFUL
            </span>
            <button
              onClick={() => setDispatchStatus(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-start gap-2">
              <Smartphone className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">SMS & Telecom Broadcast:</strong>
                <span className="text-slate-300">{dispatchStatus.channels_reached.sms_gateway}</span>
              </div>
            </div>
            <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-start gap-2">
              <Mail className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Official Authorities Dispatch:</strong>
                <span className="text-slate-300">{dispatchStatus.channels_reached.email_distribution}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts List */}
      <div className="space-y-4">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-xl p-5 shadow-xl transition-all ${
              alert.risk_level === "CRITICAL"
                ? "bg-slate-900/90 border-rose-500/60 shadow-rose-950/20"
                : "bg-slate-900/90 border-amber-500/50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      alert.category === "Emergency"
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-amber-500 text-black font-extrabold"
                    }`}
                  >
                    {alert.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {alert.alert_code}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1.5">{alert.headline}</h3>
                <span className="text-xs text-slate-400">
                  Location: <strong className="text-slate-200">{alert.location_name}</strong> ({alert.state})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                    DYNAMIC RISK SCORE
                  </span>
                  <div className="text-xl font-black text-rose-400 font-mono">
                    {alert.risk_score} / 100
                  </div>
                </div>

                <button
                  onClick={() => handleSimulateDispatch(alert)}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {simulating ? "Transmitting..." : "Simulate Broadcast"}
                </button>
              </div>
            </div>

            {/* Alert Body */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-slate-300 block mb-1">Primary Geological & Meteorological Trigger:</span>
                <p className="text-slate-400 leading-relaxed m-0">{alert.primary_reason}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-amber-300 block mb-1">Mandatory Action & Evacuation Directive:</span>
                <p className="text-slate-300 leading-relaxed m-0">{alert.recommended_action}</p>
              </div>
            </div>

            {/* Multi-channel dispatch indicators */}
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Smartphone className="h-3.5 w-3.5" /> SMS Active
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Mail className="h-3.5 w-3.5" /> SDMA/NDRF Dispatched
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Bell className="h-3.5 w-3.5" /> Push Broadcast
                </span>
              </div>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3 w-3" /> Issued: {alert.issued_at}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
