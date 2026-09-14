import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  AlertOctagon,
  Calendar,
  MapPin,
  ExternalLink
} from "lucide-react";
import { api } from "../services/api";

export default function HistoricalDatabase() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [stateFilter, setStateFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const states = ["All", "Assam", "Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"];
  const severities = ["All", "Catastrophic", "High", "Moderate", "Low"];

  useEffect(() => {
    fetchRecords();
  }, [stateFilter, severityFilter]);

  const fetchRecords = async () => {
    try {
      const data = await api.getHistoricalLandslides(stateFilter, severityFilter);
      setRecords(data);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = records.filter(
    (r) =>
      r.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.trigger_cause.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 m-0">
              NER Historical Landslide Geological Repository
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Archived geotechnical post-disaster assessments, casualty logs, and precipitation trigger histories across the 8 NER states.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Search location, cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 text-slate-900 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white w-44 sm:w-48"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            {severities.map((sv) => (
              <option key={sv} value={sv}>
                {sv}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table and Detail Modal/Side-panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2.5 font-bold">Incident Code</th>
                  <th className="pb-2.5 font-bold">Date</th>
                  <th className="pb-2.5 font-bold">Location / District</th>
                  <th className="pb-2.5 font-bold">Severity</th>
                  <th className="pb-2.5 font-bold">Casualties</th>
                  <th className="pb-2.5 font-bold">Trigger Cause</th>
                  <th className="pb-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className="text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-mono text-emerald-700 font-bold">{item.incident_code}</td>
                    <td className="py-2.5 text-slate-500">{item.date}</td>
                    <td className="py-2.5">
                      <strong className="text-slate-900 block">{item.location_name}</strong>
                      <span className="text-[11px] text-slate-500">
                        {item.district}, {item.state}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === "Catastrophic"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : item.severity === "High"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono">
                      {item.casualties > 0 ? (
                        <span className="text-rose-700 font-bold">{item.casualties} deceased</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 text-[11px] text-slate-500">{item.trigger_cause}</td>
                    <td className="py-2.5 text-right">
                      <button className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px]">
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          {selectedRecord ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-200">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {selectedRecord.incident_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedRecord.location_name}
                </h3>
                <p className="text-slate-500 text-xs">
                  {selectedRecord.district}, {selectedRecord.state} | {selectedRecord.date}
                </p>
              </div>

              <div className="space-y-1.5">
                <strong className="text-slate-800 block">Trigger Mechanism:</strong>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedRecord.trigger_cause} (24h Rainfall: {selectedRecord.rainfall_24h_mm} mm)
                </p>
              </div>

              <div className="space-y-1.5">
                <strong className="text-slate-800 block">Damage Assessment:</strong>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedRecord.infrastructure_damage}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">CASUALTIES</span>
                  <span className="text-base font-bold text-rose-700">{selectedRecord.casualties}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">INJURED</span>
                  <span className="text-base font-bold text-amber-700">{selectedRecord.injured}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <strong>Soil / Stratigraphy:</strong> {selectedRecord.soil_condition}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <History className="h-8 w-8 text-slate-300 mb-2" />
              Select an incident record to view full geological post-disaster forensic report.
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
            Source: Geological Survey of India (GSI) Landslide Compendium (NER Zone).
          </div>
        </div>
      </div>
    </div>
  );
}
