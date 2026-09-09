import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, HelpCircle, CheckCircle2, Mountain, Droplets } from "lucide-react";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

export default function Explain() {
  const { t } = useAuth();
  const [locs, setLocs] = useState([]);
  const [sel, setSel] = useState(null);
  const [out, setOut] = useState(null);

  useEffect(() => {
    get("/api/dashboard/locations").then((rows) => {
      setLocs(rows);
      setSel(rows[0]?.id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const loc = locs.find((l) => l.id === Number(sel));
    if (!loc) return;
    post("/api/predict-risk", {
      slope_deg: loc.slope_deg,
      rainfall_24h_mm: 80,
      rainfall_7d_mm: 240,
      soil_moisture_pct: 60,
      pore_pressure_kpa: 26,
      elevation_m: loc.elevation_m,
      lithology: loc.lithology,
      displacement_mm: 5,
      tilt_deg: 1.6,
    }).then(setOut).catch(console.error);
  }, [sel, locs]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-purple-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Activity className="w-4 h-4 text-purple-700" />
            <span>AI Factor Attribution & Mechanistic Explainability</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.explainability} — Why is this Slope at Risk?
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SHAP-style mathematical decomposition explaining geotechnical and rainfall trigger contributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Select Site:</span>
          <select
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            value={sel || ""}
            onChange={(e) => setSel(e.target.value)}
          >
            {locs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Factor Decomposition for {out?.risk_level} (Risk Score: {out?.risk_score}/100)
            </h2>
            <p className="text-xs text-slate-500">
              Computed via TreeSHAP feature attribution against regional geotechnical baseline.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Model: {out?.model_used || "Random Forest"}
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={out?.explainability || []} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 45]} />
              <YAxis type="category" dataKey="factor" width={170} tick={{ fontSize: 11, fill: "#334155" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v) => [`${v}%`, "Contribution"]}
              />
              <Bar dataKey="contribution_pct" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
