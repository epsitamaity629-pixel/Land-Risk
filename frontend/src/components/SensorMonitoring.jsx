import React, { useState, useEffect } from "react";
import {
  Cpu,
  Radio,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { api } from "../services/api";

export default function SensorMonitoring() {
  const [sensors, setSensors] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    api.getSensors().then(setSensors).catch(console.error);
  }, []);

  const types = ["All", "rain_gauge", "soil_moisture", "tiltmeter", "inclinometer", "pore_pressure", "temp_humidity"];
  const statuses = ["All", "Online", "Warning", "Offline/Critical"];

  const filteredSensors = sensors.filter((s) => {
    const matchType = filterType === "All" || s.sensor_type === filterType;
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Sensor Header & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              IoT Sensor Grid & Geotechnical Instrument Telemetry
            </h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Real-time wireless telemetry from borehole extensometers, biaxial tiltmeters, vibrating-wire piezometers, and FDR soil moisture probes.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Instrument Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-sky-500"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Health Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-sky-500"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sensor Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sensor.sensor_id}
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1.5">{sensor.name}</h3>
                  <p className="text-[11px] text-slate-400">{sensor.location_name}, {sensor.state}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    sensor.status === "Online"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : sensor.status === "Warning"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                  }`}
                >
                  ● {sensor.status}
                </span>
              </div>

              {/* Value display */}
              <div className="mt-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    CURRENT VALUE
                  </span>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {sensor.current_value}{" "}
                    <span className="text-xs font-semibold text-slate-400">{sensor.unit}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Threshold:</span>
                  <div className="font-mono font-bold text-rose-400 mt-0.5">
                    &gt; {sensor.critical_threshold} {sensor.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom telemetry indicators */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3 text-emerald-400" />
                {sensor.battery_level}% Battery
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" />
                {sensor.last_communication}
              </span>
              <span className="text-slate-400 font-mono">MQTT / REST</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
