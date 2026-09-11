import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, Mail, Building, ArrowRight, UserPlus, Crown, Users, Sparkles } from "lucide-react";
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

  const adminEmails = ["epsitamaity629@gmail.com", "soumyasaha205@gmail.com"];
  const isAdminEmail = adminEmails.includes(formData.email.trim().toLowerCase());

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const assignedRole = isAdminEmail ? "Admin" : formData.role;
      await register({ ...formData, role: assignedRole });
      nav("/app/dashboard");
    } catch (ex) {
      setErr(ex.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const prefillAccount = (type) => {
    if (type === "admin_epsita") {
      setFormData({
        username: "epsita",
        full_name: "Epsita Maity",
        email: "epsitamaity629@gmail.com",
        password: "password123",
        role: "Admin",
        organization: "NER Land Risk Admin Directorate"
      });
    } else if (type === "admin_soumya") {
      setFormData({
        username: "soumya",
        full_name: "Soumya Saha",
        email: "soumyasaha205@gmail.com",
        password: "password123",
        role: "Admin",
        organization: "NER Land Risk Admin Directorate"
      });
    } else {
      setFormData({
        username: "citizen_user",
        full_name: "Subir Roy",
        email: "citizen.user@gmail.com",
        password: "password123",
        role: "Citizen",
        organization: "Public Community Watch"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-lg shadow-xl space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm mb-1">
            <UserPlus className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500 font-medium">
            Register for the NER Multi-Hazard Landslide & Flood EWS Platform
          </p>
        </div>

        {/* Admin vs User Panel Role Indicator Notice */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div
            onClick={() => prefillAccount("admin_epsita")}
            className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              isAdminEmail
                ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400"
                : "bg-slate-50 border-slate-200 hover:bg-purple-50/50"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-purple-800 font-black mb-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </div>
              <p className="text-[10px] text-slate-600">
                Exclusive for <strong>epsitamaity629@gmail.com</strong> & <strong>soumyasaha205@gmail.com</strong>
              </p>
            </div>
            <span className="text-[9px] font-bold text-purple-700 mt-2">Full Command & System Access</span>
          </div>

          <div
            onClick={() => prefillAccount("citizen")}
            className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              !isAdminEmail
                ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400"
                : "bg-slate-50 border-slate-200 hover:bg-emerald-50/50"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-black mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>User Panel</span>
              </div>
              <p className="text-[10px] text-slate-600">
                For all other citizen users, field reporters & local communities.
              </p>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 mt-2">GIS Map, Alerts & Risk Search</span>
          </div>
        </div>

        {/* Live Admin Detected Notification Badge */}
        {isAdminEmail && (
          <div className="p-3 bg-purple-100/80 border border-purple-300 rounded-xl text-purple-950 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
            <span>👑 Designated System Administrator: Admin Panel will be unlocked upon login.</span>
          </div>
        )}

        {err && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Epsita Maity or Soumya Saha"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Username / Service ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. epsitamaity629@gmail.com, soumyasaha205@gmail.com or user@gmail.com"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create password"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Allocated Panel</label>
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800">
                {isAdminEmail ? "👑 Admin Panel (Full Access)" : "🛡️ User Panel (Public Access)"}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization / Agency</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-2 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. GSI / SDMA / Public"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-3"
          >
            <span>{loading ? "Creating Account..." : "Register & Enter Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
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
