import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Upload,
  Camera,
  MapPin,
  CheckCircle,
  AlertOctagon,
  Clock,
  Send
} from "lucide-react";
import { api } from "../services/api";

export default function IncidentReporting({ userRole }) {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    reporter_name: userRole === "field_officer" ? "Field Officer (GSI)" : "Resident Citizen",
    reporter_phone: "+91 98640 12345",
    reporter_type: userRole === "field_officer" ? "field_officer" : "citizen",
    location_name: "NH-10 Burtuk Hill Curve",
    state: "Sikkim",
    district: "East Sikkim",
    latitude: 27.3450,
    longitude: 88.6180,
    phenomenon_type: "Tension Cracks",
    severity: "Moderate",
    description: "Noticed expanding longitudinal cracks along roadside retaining wall with murky water seepage."
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitIncident(form);
      setMessage(res.message);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const states = ["Assam", "Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"];
  const phenomena = ["Tension Cracks", "Soil Creep", "Rockfall", "Mudflow", "Slope Failure", "Sinking Roadway"];
  const severities = ["Low", "Moderate", "High", "Catastrophic"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Crowdsourced & Field Officer Incident Reporting Portal
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Rapid geo-tagged reporting for ground deformation, tension cracks, rockfalls, and active slope failures.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Submission Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-400" />
            Submit Ground Observation Report
          </h3>

          {message && (
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Reporter Name & Affiliation:</label>
              <input
                type="text"
                value={form.reporter_name}
                onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Contact Phone / Emergency WhatsApp:</label>
              <input
                type="text"
                value={form.reporter_phone}
                onChange={(e) => setForm({ ...form, reporter_phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">State:</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">District:</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Specific Location / Landmark:</label>
              <input
                type="text"
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Observed Phenomenon:</label>
                <select
                  value={form.phenomenon_type}
                  onChange={(e) => setForm({ ...form, phenomenon_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  {phenomena.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Severity Rating:</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  {severities.map((sv) => (
                    <option key={sv} value={sv}>
                      {sv}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Latitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Detailed Description:</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                required
              ></textarea>
            </div>

            <div className="p-3 bg-slate-950/60 rounded border border-dashed border-slate-700 text-center cursor-pointer hover:border-sky-500">
              <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400">
                Click or drop photographic evidence (Geo-tagged JPG/PNG)
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Uploading Report & Running AI Assessment..." : "Transmit Report to Authorities"}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Live Incoming Incident Reports Feed */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Live Ground Observation Feed</h3>
            <span className="text-xs text-slate-400 font-mono">
              {incidents.length} Dispatched Reports
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[620px] pr-1">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-bold">
                        {inc.report_code}
                      </span>
                      <strong className="text-white text-xs">{inc.location_name}</strong>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {inc.district}, {inc.state} | Reporter: {inc.reporter_name} ({inc.reporter_type})
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.status === "Verified"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : inc.status === "Response Dispatched"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      ● {inc.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      AI Risk: <strong className="text-rose-400">{inc.ai_assessed_risk}/100</strong>
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  {inc.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Type: <strong className="text-slate-200">{inc.phenomenon_type}</strong> ({inc.severity} Severity)</span>
                  <span className="font-mono text-[10px]">
                    GPS: {inc.latitude.toFixed(4)}°N, {inc.longitude.toFixed(4)}°E
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
