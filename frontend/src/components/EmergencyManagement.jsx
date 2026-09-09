import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  PhoneCall,
  Shield,
  Hospital,
  Flame,
  AlertOctagon,
  Navigation,
  ExternalLink
} from "lucide-react";
import { api } from "../services/api";

export default function EmergencyManagement() {
  const [facilities, setFacilities] = useState([]);
  const [selectedState, setSelectedState] = useState("All");

  useEffect(() => {
    api.getEmergencyFacilities().then(setFacilities).catch(console.error);
  }, []);

  const states = ["All", "Sikkim", "Assam", "Manipur", "Mizoram", "Meghalaya", "Arunachal Pradesh", "Nagaland", "Tripura"];

  const filtered = facilities.filter(
    (f) => selectedState === "All" || f.state === selectedState
  );

  const getIcon = (type) => {
    switch (type) {
      case "hospital":
        return <Hospital className="h-5 w-5 text-rose-400" />;
      case "ndrf_base":
        return <Shield className="h-5 w-5 text-sky-400" />;
      case "fire_station":
        return <Flame className="h-5 w-5 text-amber-400" />;
      case "blocked_road":
        return <AlertOctagon className="h-5 w-5 text-red-500 animate-pulse" />;
      default:
        return <LifeBuoy className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Disaster Response, Safe Shelters & Evacuation Logistics
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Active NDRF response centers, reinforced cyclone/landslide safe shelters, trauma hospitals, and blocked road bypass routing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter by State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-sky-500"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl flex items-center gap-3 text-xs">
          <PhoneCall className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">NATIONAL DISASTER HELPLINE</span>
            <strong className="text-rose-400 text-sm font-mono font-black">1078 / 112</strong>
          </div>
        </div>

        <div className="bg-sky-950/40 border border-sky-500/40 p-3 rounded-xl flex items-center gap-3 text-xs">
          <Shield className="h-5 w-5 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">NDRF HEADQUARTERS</span>
            <strong className="text-sky-400 text-sm font-mono font-black">011-24363260</strong>
          </div>
        </div>

        <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl flex items-center gap-3 text-xs">
          <Hospital className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">AMBULANCE & TRIAGE</span>
            <strong className="text-amber-400 text-sm font-mono font-black">108</strong>
          </div>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-3 text-xs">
          <LifeBuoy className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">STATE DISASTER MANAGEMENT (SDMA)</span>
            <strong className="text-emerald-400 text-sm font-mono font-black">1070 / 1077</strong>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fac) => (
          <div
            key={fac.id}
            className={`border rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3 ${
              fac.facility_type === "blocked_road"
                ? "bg-rose-950/20 border-rose-500/50"
                : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                  {getIcon(fac.facility_type)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-snug">{fac.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    {fac.district}, {fac.state}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 bg-slate-950/60 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                {fac.details}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="font-mono text-emerald-400 font-bold">
                📞 {fac.contact_phone}
              </span>
              <span className="text-slate-400">
                {fac.capacity_persons > 0 ? `Capacity: ${fac.capacity_persons} pax` : "Roadway Warning"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
