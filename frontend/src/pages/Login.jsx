import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, Home, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErr("Please enter both username/email and password.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      nav("/app/dashboard");
    } catch (ex) {
      setErr(ex.message || "Invalid username/email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 selection:bg-emerald-500 selection:text-white relative">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition group"
      >
        <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
        <span>Back to Bhu-Surakha Home</span>
      </Link>

      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 mb-1">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bhu-Surakha
            </h1>
            <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
              Multi-Hazard Early Warning Platform
            </p>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Sign in to access real-time landslide, flood & geo-hazard intelligence
          </p>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Username or Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your registered username or email"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Bhu-Surakha</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="mt-8 text-center text-[11px] text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Bhu-Surakha Grid Live · NER & Pan-India Surveillance</span>
        </p>
        <p>© 2026 Bhu-Surakha · Predict Risk · Warn Early · Protect Lives</p>
      </div>
    </div>
  );
}
