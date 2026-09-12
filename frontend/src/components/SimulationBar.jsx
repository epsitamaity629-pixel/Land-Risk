import { useEffect, useState } from "react";
import { Play, CloudLightning, Activity } from "lucide-react";
import { get, post } from "../api";

export default function SimulationBar() {
  const [state, setState] = useState({ running: false, scenario: "idle", speed: 1 });
  const [last, setLast] = useState(null);

  const refresh = () => get("/api/simulation/state").then(setState).catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(async () => {
      try {
        const tick = await post("/api/simulation/tick", {});
        setLast(tick);
        setState(tick.state || state);
        window.dispatchEvent(new CustomEvent("ner-sim-tick", { detail: tick }));
      } catch {
        /* ignore */
      }
    }, 2500);
    return () => clearInterval(id);
  }, [state.running]);

  const start = async (scenario) => {
    const st = await post("/api/simulation/control", { running: true, speed: 2, scenario });
    setState(st);
  };

  const stop = async () => {
    const st = await post("/api/simulation/control", { running: false, speed: 1, scenario: "idle" });
    setState(st);
  };

  const n = last?.alerts_created?.length || 0;

  return (
    <div className="fixed bottom-14 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-md max-w-[95vw] overflow-x-auto custom-scrollbar">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${state.running ? "pulse-dot" : ""}`} />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <span className="text-xs text-slate-700 font-bold hidden md:inline shrink-0">Simulation:</span>
      <button
        onClick={() => start("monsoon")}
        className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 transition"
      >
        <Play className="w-3 h-3" /> Monsoon
      </button>
      <button
        onClick={() => start("cloudburst")}
        className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 transition"
      >
        <CloudLightning className="w-3 h-3" /> Cloudburst
      </button>
      <button
        onClick={() => start("tremor")}
        className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 transition"
      >
        <Activity className="w-3 h-3" /> Tremor
      </button>
      {state.running && (
        <button
          onClick={stop}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full shrink-0 transition"
        >
          Stop
        </button>
      )}
      {n > 0 && <span className="text-[11px] font-bold text-rose-700 shrink-0">{n} alerts</span>}
    </div>
  );
}
