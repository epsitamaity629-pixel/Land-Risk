import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, Mail, Building, ArrowRight, UserPlus } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    role: "Citizen",
    organization: "Public"
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "Citizen", label: "Citizen / Public" },
    { id: "Field Officer", label: "Field Officer (GSI / BRO / PWD)" },
    { id: "Disaster Management Authority", label: "Disaster Management (SDMA / DDMA)" },
    { id: "Admin", label: "System Administrator" }
  ];

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await register(formData);
      nav("/app/dashboard");
    } catch (ex) {
      setErr(ex.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-md shadow-lg space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs mb-1">
            <UserPlus className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500 font-medium">
            Register for the NER Landslide & Multi-Hazard EWS Platform
          </p>
        </div>

        {err && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Sharma"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Username / Service ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter unique username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. user@gov.in or email@gmail.com"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Designated Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization / Agency</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. GSI / SDMA"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Registering Account..." : "Create Account & Sign In"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
