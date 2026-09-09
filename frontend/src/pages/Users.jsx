import { useEffect, useState } from "react";
import { Users as UsersIcon, Shield, CheckCircle2 } from "lucide-react";
import { get, post } from "../api";
import { useAuth } from "../AuthContext";

export default function Users() {
  const { t } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get("/api/admin/users").then(setRows).catch(console.error);
  }, []);

  const change = async (username, role) => {
    await post("/api/admin/users/role", { username, role });
    setRows(await get("/api/admin/users"));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
            <UsersIcon className="w-4 h-4 text-emerald-700" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.usersRoles} & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorization access for Disaster Authorities, Field Officers, and Public Citizens.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Full Name</th>
              <th className="px-3">Username & Email</th>
              <th className="px-3">Organization</th>
              <th className="px-3 text-right">Assigned Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{u.full_name}</td>
                <td className="px-3 text-slate-500 font-mono">{u.username} ({u.email || "eoc@ner.gov.in"})</td>
                <td className="px-3 text-slate-600 font-medium">{u.organization || "Disaster Control"}</td>
                <td className="px-3 text-right">
                  <select
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={u.role}
                    onChange={(e) => change(u.username, e.target.value)}
                  >
                    <option>Admin</option>
                    <option>Disaster Management Authority</option>
                    <option>Field Officer</option>
                    <option>Citizen</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
