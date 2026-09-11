import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, User, Key, CheckCircle, ArrowRight, Crown, Users } from "lucide-react";
import { useAuth } from "../AuthContext";
import { get } from "../api";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("epsita");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState("");
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get("/api/auth/demo-users").then(setDemos).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(username, password);
      nav("/app/dashboard");
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const adminDemos = demos.filter((d) => d.role === "Admin");
  const userDemos = demos.filter((d) => d.role !== "Admin");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-lg shadow-xl space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm mb-1">
            <Shield className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">NER EWS Command Center</h1>
          <p className="text-xs text-slate-500 font-medium">
            Multi-Hazard Landslide & Flood Monitoring System · Authorized Sign In
          </p>
        </div>

        {err && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Username or Official Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Signing In..." : "Sign In to EWS Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => nav("/register")}
            className="text-emerald-700 font-black hover:underline"
          >
            Register here
          </button>
        </div>

        {/* One-Click Quick Login Roles with Clear Admin vs User Separation */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {/* Admin Accounts */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-purple-800 mb-2">
              <Crown className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Panel Quick Access:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {adminDemos.map((d) => (
                <button
                  type="button"
                  key={d.username}
                  className="text-left text-xs bg-purple-50/70 border border-purple-200 rounded-xl p-2.5 hover:bg-purple-100 hover:border-purple-400 transition"
                  onClick={() => {
                    setUsername(d.email || d.username);
                    setPassword(d.password);
                  }}
                >
                  <div className="font-extrabold text-purple-950 text-xs truncate">{d.full_name}</div>
                  <div className="text-[10px] text-purple-700 font-bold truncate">👑 Admin Panel</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{d.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* User / Citizen Accounts */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-800 mb-2">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>User Panel Quick Access:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {userDemos.map((d) => (
                <button
                  type="button"
                  key={d.username}
                  className="text-left text-xs bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 hover:bg-emerald-100 hover:border-emerald-400 transition"
                  onClick={() => {
                    setUsername(d.email || d.username);
                    setPassword(d.password);
                  }}
                >
                  <div className="font-extrabold text-emerald-950 text-xs truncate">{d.full_name}</div>
                  <div className="text-[10px] text-emerald-700 font-bold truncate">🛡️ {d.role}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
