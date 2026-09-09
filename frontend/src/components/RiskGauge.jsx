export default function RiskGauge({ score = 0, label = "NER risk index" }) {
  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f97316" : score >= 40 ? "#f59e0b" : "#10b981";
  const r = 54;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(score, 100) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} stroke="#1e293b" strokeWidth="12" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="74" textAnchor="middle" fill="white" fontSize="28" fontWeight="700">
          {Math.round(score)}
        </text>
      </svg>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
