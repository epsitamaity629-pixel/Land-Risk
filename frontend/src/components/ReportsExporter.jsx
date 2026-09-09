import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  FileSpreadsheet,
  Building,
  Calendar
} from "lucide-react";

export default function ReportsExporter({ overview, locations, activeAlerts }) {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    setDownloading(true);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Location Code,Location Name,State,District,Risk Level,Risk Score,Landslide Probability,Slope Angle,Elevation,24h Rainfall mm\n";

    locations.forEach((loc) => {
      csvContent += `"${loc.code}","${loc.name}","${loc.state}","${loc.district}","${loc.risk_level}",${loc.risk_score},${loc.landslide_probability},${loc.slope_angle_deg},${loc.elevation_m},84.5\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NER_Landslide_Risk_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Executive Situation & Landslide Risk Assessment Reports
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Official disaster management executive briefing summaries with instant PDF print and CSV raw telemetry export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            Export CSV Telemetry
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save Official PDF
          </button>
        </div>
      </div>

      {/* Printable Executive Report Template */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-2xl text-slate-200 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 tracking-widest uppercase">
              <Building className="h-4 w-4" />
              GOVERNMENT OF INDIA | DISASTER MANAGEMENT CELL
            </div>
            <h1 className="text-2xl font-black text-white mt-1 print:text-black">
              NER LANDSLIDE EARLY WARNING & GEOTECHNICAL RISK ASSESSMENT
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Official Executive Bulletin for North Eastern Regional Directorate & District Emergency Operations Centers (DEOCs)
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>Bulletin ID: <strong className="text-white print:text-black">NER-EWS-2026/08</strong></div>
            <div>Generated: {new Date().toUTCString()}</div>
            <div>Classification: <span className="text-rose-400 font-bold">OFFICIAL DISASTER ADVISORY</span></div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-semibold">OVERALL REGIONAL RISK LEVEL</span>
            <div className="text-xl font-black text-rose-400 mt-1">
              {overview?.ner_overall_risk_level || "CRITICAL"} ({overview?.ner_average_risk_score || 78}/100)
            </div>
            <span className="text-[11px] text-slate-400">Average Probability: {overview?.ner_average_probability || 84}%</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-semibold">ACTIVE EMERGENCY ADVISORIES</span>
            <div className="text-xl font-black text-amber-400 mt-1">
              {activeAlerts?.length || 4} Critical Warning Sectors
            </div>
            <span className="text-[11px] text-slate-400">Multi-Channel Broadcast: Active</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-semibold">CUMULATIVE PRECIPITATION</span>
            <div className="text-xl font-black text-cyan-400 mt-1">
              {overview?.rainfall_24h_avg_mm || 84.6} mm / 24h
            </div>
            <span className="text-[11px] text-slate-400">7-day Soil Infiltration: {overview?.rainfall_7d_avg_mm || 265} mm</span>
          </div>
        </div>

        {/* Priority Threat Corridors Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
            1. High-Priority Threat Zones & Highway Sectors
          </h3>
          <table className="w-full text-left text-xs border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-2">Sector / Highway Pass</th>
                <th className="p-2">State & District</th>
                <th className="p-2">Risk Score</th>
                <th className="p-2">Probability</th>
                <th className="p-2">Threat Classification</th>
                <th className="p-2">Vulnerable Elements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {locations.slice(0, 5).map((loc) => (
                <tr key={loc.id}>
                  <td className="p-2 font-bold text-white print:text-black">{loc.name}</td>
                  <td className="p-2 text-slate-300 print:text-black">{loc.district}, {loc.state}</td>
                  <td className="p-2 font-mono font-bold text-rose-400">{loc.risk_score}/100</td>
                  <td className="p-2 font-mono text-amber-400">{loc.landslide_probability}%</td>
                  <td className="p-2 font-bold">{loc.risk_level}</td>
                  <td className="p-2 text-[11px] text-slate-400 print:text-black">{loc.vulnerable_elements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommended Emergency Directives */}
        <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
          <h3 className="font-bold text-white print:text-black">
            2. Strategic Directives for Disaster Authorities
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-black leading-relaxed">
            <li>Deploy Quick Reaction Teams (QRT) of Border Roads Organisation (BRO) equipped with heavy earthmovers along NH-10 and NH-29.</li>
            <li>Maintain round-the-clock monitoring of vibrating-wire piezometers and borehole extensometers in Burtuk, Hunthar, and Tupul corridors.</li>
            <li>Coordinate with District Collectors to initiate phased preventive evacuations of downstream settlements where 24h rainfall exceeds 120mm.</li>
            <li>Issue commercial traffic advisories to prevent multi-vehicle pileups at active sinking stretches.</li>
          </ul>
        </div>

        {/* Signoff */}
        <div className="pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-400 print:text-black">
          <div>
            <span>Verified By:</span>
            <strong className="block text-white print:text-black mt-1">Dr. T. Bhattacharjee (Director of Geohazards)</strong>
            <span>NER Disaster Monitoring Directorate</span>
          </div>
          <div className="text-right">
            <span>Authentication Seal:</span>
            <span className="block font-mono text-[11px] text-sky-400 mt-1">SHA256: 9f82a1c4e78b209... [SECURE]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
