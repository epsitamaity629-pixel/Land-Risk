import { useEffect, useState } from "react";
import { FileText, Printer, Download, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";

export default function Reports() {
  const { t } = useAuth();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    get("/api/reports/executive").then(setDoc).catch(console.error);
  }, []);

  const csv = () => {
    window.open("/api/reports/export.csv", "_blank");
  };

  if (!doc) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-xs">
        Loading executive briefing...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Official Government Intelligence Dossier</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.executiveReports}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={csv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Dossier Document Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none">
        <div className="flex justify-between items-start pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              State EOC Briefing · Confidential
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{doc.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Generated: {doc.generated_at}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">NER Disaster Management Grid</span>
            <span className="text-[11px] text-slate-400">Govt. of India</span>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {doc.coverage}
        </p>

        {/* 3 Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-3xl font-extrabold text-slate-900 block">{doc.stations}</span>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">Monitored Stations</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-3xl font-extrabold text-slate-900 block">{doc.sensors}</span>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">Active Sensor Nodes</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-3xl font-extrabold text-orange-700 block">{doc.active_alerts}</span>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">Active Warning Directives</span>
          </div>
        </div>

        {/* Highest Risk Corridors */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-2">Highest Risk Priority Corridors</h3>
          <div className="space-y-1.5">
            {doc.highest_risk.map((h, i) => (
              <div
                key={h.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">#{i + 1}</span>
                  <span className="font-bold text-slate-900">{h.name}</span>
                  <span className="text-slate-500">({h.state})</span>
                </div>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Score: {h.score} · {h.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Executive Action Directives</h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {doc.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
