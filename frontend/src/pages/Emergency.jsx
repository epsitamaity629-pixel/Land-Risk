import { useEffect, useState } from "react";
import { Siren, Shield, Hospital, Building, PhoneCall, AlertTriangle } from "lucide-react";
import { get } from "../api";
import { useAuth } from "../AuthContext";

export default function Emergency() {
  const { t } = useAuth();
  const [locs, setLocs] = useState([]);
  const [id, setId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [facs, setFacs] = useState([]);

  useEffect(() => {
    get("/api/dashboard/locations").then((r) => {
      setLocs(r);
      setId(r[0]?.id);
    }).catch(console.error);
    get("/api/emergency/facilities").then(setFacs).catch(console.error);
  }, []);

  useEffect(() => {
    if (id) get(`/api/emergency/plan?location_id=${id}`).then(setPlan).catch(console.error);
  }, [id]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Siren className="w-4 h-4 text-red-700" />
            <span>Disaster Response & Evacuation Grid</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.evacuation}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinated evacuation corridors, nearest safe shelters, district EOCs, and NDRF battalion dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Target Area:</span>
          <select
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            value={id || ""}
            onChange={(e) => setId(e.target.value)}
          >
            {locs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {plan && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Shelters */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 pb-2 border-b border-slate-100">
              <Building className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">Designated High-Ground Safe Shelters</h2>
            </div>
            <div className="space-y-2">
              {(plan.nearest_shelters || []).map((f) => (
                <div key={f.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{f.name}</span>
                    <span className="text-emerald-700 font-bold">Capacity: {f.capacity}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{f.notes}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">Contact: {f.contact || "1077"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hospitals */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-800 pb-2 border-b border-slate-100">
              <Hospital className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">Designated Trauma Centers & Hospitals</h2>
            </div>
            <div className="space-y-2">
              {(plan.nearest_hospitals || []).map((f) => (
                <div key={f.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{f.name}</span>
                    <span className="text-blue-700 font-bold">{f.capacity} Beds</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{f.notes}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">Emergency: {f.contact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NDRF & SDRF Bases */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-purple-800 pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-purple-700" />
              <h2 className="text-sm font-bold text-slate-900">NDRF / SDRF Rapid Action Battalions</h2>
            </div>
            <div className="space-y-2">
              {(plan.ndrf || []).map((f) => (
                <div key={f.id} className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-xs space-y-0.5">
                  <span className="font-bold text-purple-950 block">{f.name}</span>
                  <p className="text-purple-800 text-[11px] font-medium">{f.notes}</p>
                  <p className="text-purple-700 text-[11px] font-bold">Helpline: {f.contact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Directory Contacts */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-slate-100">
              <PhoneCall className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">District Emergency Directory</h2>
            </div>
            <div className="space-y-2 text-xs">
              {(plan.contacts || []).map((c) => (
                <div key={c.agency} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">{c.agency}</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{c.phone}</span>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 pt-1">
                Estimated Population in Immediate Risk Buffer: <strong className="text-slate-800">{plan.population_exposed} citizens</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
