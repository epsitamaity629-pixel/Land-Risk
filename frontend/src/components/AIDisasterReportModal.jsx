import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  X,
  ShieldAlert,
  Calendar,
  MapPin,
  Mountain,
  Droplets,
  Activity,
  AlertTriangle,
  Building2,
  Users,
  Compass,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { generateAIReport } from "../api";

export default function AIDisasterReportModal({ isOpen, onClose, locationData, query = "" }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      generateAIReport(query || locationData?.location?.name || "Shillong", locationData)
        .then((res) => {
          setReport(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Report generation failed:", err);
          setLoading(false);
        });
    }
  }, [isOpen, locationData, query]);

  if (!isOpen) return null;

  const loc = report?.location || locationData?.location || {};
  const earlyWarning = report?.early_warning || {};
  const impact = report?.potential_impact || {};

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = `
# BHU-SURAKHA — LOCATION DISASTER RISK INTELLIGENCE REPORT
**Report ID:** ${report.report_id}
**Generated:** ${report.generated_at}
**Target Location:** ${loc.name}, ${loc.district}, ${loc.state}, India
**Coordinates:** ${loc.latitude}°N, ${loc.longitude}°E | **Elevation:** ${loc.elevation_m}m | **Slope:** ${loc.slope_deg}°

---

### 1. SITUATION SUMMARY
${report.situation_summary}

### 2. HISTORICAL DISASTER CONTEXT
${report.historical_context}

### 3. CURRENT ENVIRONMENTAL & TELEMETRY CONDITIONS
${report.current_conditions}

### 4. MULTI-HAZARD RISK ASSESSMENT
- **Overall Disaster Risk:** ${report.risk_assessment?.overall_disaster_risk}
- **Landslide Susceptibility:** ${report.risk_assessment?.landslide_susceptibility}
- **Flood & Inundation Risk:** ${report.risk_assessment?.flood_inundation_risk}
- **Seismic Vulnerability:** ${report.risk_assessment?.seismic_vulnerability}
- **Extreme Rainfall Hazard:** ${report.risk_assessment?.extreme_rainfall_hazard}

### 5. MAIN RISK DRIVERS (EXPLAINABLE AI)
${report.main_risk_drivers?.map((d) => `- **${d.hazard} (${d.parameter})**: ${d.contribution_pct}% contribution — ${d.explanation}`).join("\n")}

### 6. FUTURE OUTLOOK & PROJECTIONS
${report.future_outlook}

### 7. POTENTIALLY EXPOSED ASSETS & IMPACT
- **Population Exposed:** ${impact.estimated_exposed_population}
- **Vulnerable Highways:** ${impact.vulnerable_road_network}
- **Bridges & Culverts:** ${impact.bridges_culverts_exposed}
- **Educational Institutions:** ${impact.educational_institutions}
- **Healthcare Centers:** ${impact.healthcare_facilities}
- *Disclaimer:* ${impact.disclaimer}

### 8. EARLY WARNING LEVEL
**Level:** ${earlyWarning.level}
**Directive:** ${earlyWarning.banner}
**Confidence:** ${earlyWarning.confidence_pct}% | **Lead Time:** ${earlyWarning.lead_time_hours} Hours

### 9. RECOMMENDED ACTIONS
${report.recommended_actions?.map((a, i) => `${i + 1}. ${a}`).join("\n")}

---
**Verified Data Providers:** IMD, CWC, GSI, NDMA, ISRO/Bhuvan, Open-Meteo
**Model Validation:** Ensemble Random Forest + Gradient Boosting Calibrated Models
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-base font-black tracking-tight text-slate-900">
                  AI Disaster Intelligence & Risk Assessment Report
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                  Official NDMA/NER Format
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Comprehensive 9-Section Multi-Hazard Profile for <span className="text-emerald-700 font-semibold">{loc.name}, {loc.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition"
              title="Copy formatted Markdown"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-slate-50/50 print:bg-white print:text-black">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Synthesizing multi-source telemetry, historical failure archives & machine learning inference...
              </p>
            </div>
          ) : report ? (
            <div className="space-y-5 text-xs leading-relaxed">
              {/* Report Metadata Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Report Reference</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">{report.report_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Target Location</span>
                  <span className="text-xs font-bold text-slate-900">{loc.name}, {loc.district} ({loc.state})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Coordinates & Elevation</span>
                  <span className="text-xs font-mono text-slate-700">{loc.latitude}°N, {loc.longitude}°E · ~{loc.elevation_m}m MSL</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Generated Timestamp</span>
                  <span className="text-xs font-mono text-slate-700">{report.generated_at}</span>
                </div>
              </div>

              {/* 1. Situation Summary */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>1. Situation Summary</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{report.situation_summary}</p>
              </div>

              {/* 2. Historical Context */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>2. Historical Disaster Context</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{report.historical_context}</p>
              </div>

              {/* 3. Current Conditions */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>3. Current Environmental & Telemetry Conditions</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{report.current_conditions}</p>
              </div>

              {/* 4. Risk Assessment Breakdown */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>4. Multi-Hazard Risk Assessment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {Object.entries(report.risk_assessment || {}).map(([k, v], i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block capitalize">
                        {k.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-black text-slate-900 mt-0.5 block">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Main Risk Drivers (Explainable AI) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>5. Main Risk Drivers (Explainable AI SHAP Attribution)</span>
                </div>
                <div className="space-y-2">
                  {report.main_risk_drivers?.map((d, i) => (
                    <div key={i} className="flex items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{d.parameter}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                            {d.hazard}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{d.explanation}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-700">{d.contribution_pct}%</span>
                        <span className="text-[9px] text-slate-500 block">{d.impact_direction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Future Outlook */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-rose-600" />
                  <span>6. Future Outlook & Projections</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{report.future_outlook}</p>
              </div>

              {/* 7. Potential Impact (Exposed Assets) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>7. Estimated Potentially Exposed Assets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Population Exposed</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{impact.estimated_exposed_population}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Vulnerable Highways</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{impact.vulnerable_road_network}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Bridges / Culverts</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{impact.bridges_culverts_exposed}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Schools Exposed</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{impact.educational_institutions}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Hospitals / Clinics</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{impact.healthcare_facilities}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Habitations / Wards</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{impact.villages_wards_affected}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">⚠️ {impact.disclaimer}</p>
              </div>

              {/* 8. Early Warning Alert Directive */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-rose-800 uppercase tracking-wider">
                    8. Early Warning Protocol: {earlyWarning.level}
                  </span>
                  <span className="text-[10px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                    Lead Time: {earlyWarning.lead_time_hours} Hours · Confidence: {earlyWarning.confidence_pct}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-rose-950">{earlyWarning.banner}</p>
              </div>

              {/* 9. Recommended Actions */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>9. Recommended Actions & Mitigation Protocols</span>
                </div>
                <div className="space-y-1.5">
                  {report.recommended_actions?.map((act, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700 text-xs font-medium">
                      <span className="text-emerald-700 font-bold shrink-0">{i + 1}.</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Sources & Data Provenance */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Data Provenance & Model Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {report.data_sources?.map((ds, i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 text-[10px] border border-slate-200">
                      <span className="font-bold text-slate-800 block">{ds.agency}</span>
                      <span className="text-slate-600 block">{ds.telemetry}</span>
                      <span className="text-emerald-700 font-mono text-[9px] font-bold">{ds.freshness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-10">Report data unavailable.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[200px] sm:max-w-none">Bhu-Surakha · Multi-Hazard Intelligence Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
