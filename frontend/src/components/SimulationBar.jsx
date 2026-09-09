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
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[2000] glass rounded-full px-4 py-2 flex items-center gap-2 shadow-glow">
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${state.running ? "pulse-dot" : ""}`} />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs text-slate-300 hidden sm:inline">Live simulation</span>
      <button onClick={() => start("monsoon")} className="text-xs bg-emerald-600/80 hover:bg-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
        <Play className="w-3 h-3" /> Start
      </button>
      <button onClick={() => start("cloudburst")} className="text-xs bg-orange-600/80 px-3 py-1 rounded-full flex items-center gap-1">
        <CloudLightning className="w-3 h-3" /> Cloudburst
      </button>
      <button onClick={() => start("tremor")} className="text-xs bg-rose-700/80 px-3 py-1 rounded-full flex items-center gap-1">
        <Activity className="w-3 h-3" /> Tremor
      </button>
      <button onClick={stop} className="text-xs text-slate-400 px-2">
        Stop
      </button>
      {n > 0 && <span className="text-[11px] text-rose-300">{n} new alerts</span>}
    </div>
  );
}
