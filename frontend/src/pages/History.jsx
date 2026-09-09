import { useEffect, useState } from "react";
import { History as HistoryIcon, Search, Filter, AlertTriangle, MapPin, Calendar, Users, Eye } from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";

export default function History() {
  const { t } = useAuth();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState("");
  const [year, setYear] = useState("");
  const [sev, setSev] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    get("/api/dashboard/history").then(setRows).catch(console.error);
  }, []);

  const states = [...new Set(rows.map((r) => r.state))];
  const filtered = rows.filter(
    (r) => (!state || r.state === state) && (!year || String(r.year) === year) && (!sev || r.severity === sev)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <HistoryIcon className="w-4 h-4 text-emerald-700" />
            <span>Geological & Hydrological Incident Archive</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.incidentDatabase}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical repository of major landslide failures, cloudbursts, riverbank erosion, and infrastructure collapses in NER.
          </p>
        </div>

        <span className="text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg">
          {filtered.length} Archived Events
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter Records:</span>
        </div>

        <select
          className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">All 8 NER States</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-1.5 w-28 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Filter Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <select
          className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={sev}
          onChange={(e) => setSev(e.target.value)}
        >
          <option value="">All Severity Levels</option>
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
          <option>Catastrophic</option>
        </select>

        {(state || year || sev) && (
          <button
            onClick={() => {
              setState("");
              setYear("");
              setSev("");
            }}
            className="text-xs text-red-600 font-semibold hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Historical Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event Name & Location</th>
                <th className="px-3">State / District</th>
                <th className="px-3 text-center">Year</th>
                <th className="px-3 text-center">Casualties</th>
                <th className="px-3 text-center">Trigger Cause</th>
                <th className="px-3 text-right">Severity</th>
                <th className="px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-slate-50 transition cursor-pointer ${open?.id === r.id ? "bg-emerald-50/50" : ""}`}
                  onClick={() => setOpen(r)}
                >
                  <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                  <td className="px-3 text-slate-600">
                    {r.state} · {r.district}
                  </td>
                  <td className="px-3 text-center font-mono font-semibold">{r.year}</td>
                  <td className="px-3 text-center font-mono font-bold text-red-600">{r.casualties}</td>
                  <td className="px-3 text-center text-slate-600 truncate max-w-[140px]">{r.trigger_cause}</td>
                  <td className="px-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.severity === "Catastrophic"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : r.severity === "High"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-3 text-center">
                    <button className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] flex items-center gap-1 mx-auto">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector for Event Details */}
      {open && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Detailed Event Dossier</span>
              <h3 className="font-bold text-slate-900 text-base">{open.name}</h3>
            </div>
            <button
              onClick={() => setOpen(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕ Close Dossier
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Date & Geological Formation</span>
              <span className="font-bold text-slate-800">{open.event_date || open.year} · {open.geological_formation || "Sedimentary"}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Trigger Factor</span>
              <span className="font-bold text-slate-800">{open.trigger_cause}</span>
            </div>

            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <span className="text-red-600 block text-[10px]">Recorded Fatalities</span>
              <span className="font-extrabold text-red-800 text-sm">{open.casualties} Fatalities</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">Infrastructure Damage & Lifeline Interruption:</span>
            <p className="text-slate-700 leading-relaxed font-medium">{open.infrastructure_damage}</p>
            {open.notes && <p className="text-slate-500 italic text-[11px] mt-1">{open.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
