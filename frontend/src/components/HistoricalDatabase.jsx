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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              NER Historical Landslide Geological Repository
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Archived geotechnical post-disaster assessments, casualty logs, and precipitation trigger histories across the 8 NER states.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Search location, cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 w-48"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-sky-500"
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
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-sky-500"
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
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">Incident Code</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">Location / District</th>
                  <th className="pb-2.5 font-semibold">Severity</th>
                  <th className="pb-2.5 font-semibold">Casualties</th>
                  <th className="pb-2.5 font-semibold">Trigger Cause</th>
                  <th className="pb-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className="text-slate-300 hover:bg-slate-800/50 cursor-pointer transition-all"
                  >
                    <td className="py-2.5 font-mono text-sky-400 font-bold">{item.incident_code}</td>
                    <td className="py-2.5 text-slate-400">{item.date}</td>
                    <td className="py-2.5">
                      <strong className="text-white block">{item.location_name}</strong>
                      <span className="text-[11px] text-slate-400">
                        {item.district}, {item.state}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === "Catastrophic"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : item.severity === "High"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono">
                      {item.casualties > 0 ? (
                        <span className="text-rose-400 font-bold">{item.casualties} deceased</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 text-[11px] text-slate-400">{item.trigger_cause}</td>
                    <td className="py-2.5">
                      <button className="text-sky-400 hover:text-sky-300 font-semibold text-[11px]">
                        Inspect Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          {selectedRecord ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedRecord.incident_code}
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  {selectedRecord.location_name}
                </h3>
                <p className="text-slate-400 text-xs">
                  {selectedRecord.district}, {selectedRecord.state} | {selectedRecord.date}
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-300 block">Trigger Mechanism:</strong>
                <p className="text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  {selectedRecord.trigger_cause} (24h Rainfall: {selectedRecord.rainfall_24h_mm} mm)
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-300 block">Damage Assessment:</strong>
                <p className="text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  {selectedRecord.infrastructure_damage}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] text-slate-400 block">CASUALTIES</span>
                  <span className="text-base font-bold text-rose-400">{selectedRecord.casualties}</span>
                </div>
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-slate-400 block">INJURED</span>
                  <span className="text-base font-bold text-amber-400">{selectedRecord.injured}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded">
                <strong>Soil / Stratigraphy:</strong> {selectedRecord.soil_condition}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <History className="h-8 w-8 text-slate-600 mb-2" />
              Select an incident record to view full geological post-disaster forensic report.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Source: Geological Survey of India (GSI) Landslide Compendium (NER Zone).
          </div>
        </div>
      </div>
    </div>
  );
}
