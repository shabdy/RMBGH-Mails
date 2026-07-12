import { useState, useEffect } from "react";
import { Building2, Users, UserCheck, Clock } from "lucide-react";
import { getAllUsers } from "@/services/accountsService";

const DEPT_LIST = [
  { name: "Administration",         id: "ADMIN",  bg: "bg-yellow-100",  text: "text-yellow-700", border: "border-yellow-200" },
  { name: "Human Resources",        id: "HR",     bg: "bg-purple-100",  text: "text-purple-700", border: "border-purple-200" },
  { name: "Information Technology", id: "IT",     bg: "bg-blue-100",    text: "text-blue-700",   border: "border-blue-200"   },
  { name: "Nursing",                id: "NUR",    bg: "bg-pink-100",    text: "text-pink-700",   border: "border-pink-200"   },
  { name: "Laboratory",             id: "LAB",    bg: "bg-green-100",   text: "text-green-700",  border: "border-green-200"  },
  { name: "Pharmacy",               id: "PHARM",  bg: "bg-teal-100",    text: "text-teal-700",   border: "border-teal-200"   },
  { name: "Radiology",              id: "RAD",    bg: "bg-cyan-100",    text: "text-cyan-700",   border: "border-cyan-200"   },
  { name: "Surgery",                id: "SURG",   bg: "bg-red-100",     text: "text-red-700",    border: "border-red-200"    },
  { name: "Medical Records",        id: "MR",     bg: "bg-slate-100",   text: "text-slate-700",  border: "border-slate-200"  },
  { name: "Finance",                id: "FIN",    bg: "bg-emerald-100", text: "text-emerald-700",border: "border-emerald-200"},
  { name: "Maintenance",            id: "MAINT",  bg: "bg-orange-100",  text: "text-orange-700", border: "border-orange-200" },
  { name: "Security",               id: "SEC",    bg: "bg-gray-100",    text: "text-gray-700",   border: "border-gray-200"   },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers().then(u => setUsers(u));
  }, []);

  const total    = users.length;
  const active   = users.filter(u => u.status === "Active").length;
  const pending  = users.filter(u => u.status === "Pending").length;

  /* Enrich dept list with counts */
  const depts = DEPT_LIST.map(d => {
    const members  = users.filter(u => u.departmentId === d.id || u.department === d.name);
    return {
      ...d,
      total:    members.length,
      active:   members.filter(u => u.status === "Active").length,
      pending:  members.filter(u => u.status === "Pending").length,
      inactive: members.filter(u => u.status === "Inactive").length,
    };
  });

  /* Any users assigned to unknown departments */
  const knownIds   = new Set(DEPT_LIST.map(d => d.id));
  const knownNames = new Set(DEPT_LIST.map(d => d.name));
  const unassigned = users.filter(u => !knownIds.has(u.departmentId) && !knownNames.has(u.department));

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Department Management</h1>
        <p className="text-sm text-muted-foreground">Overview of hospital departments and their staff</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Departments"  value={DEPT_LIST.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Users}     label="Total Staff"  value={total}            color="bg-slate-100 text-slate-600" />
        <StatCard icon={UserCheck} label="Active Staff" value={active}           color="bg-green-100 text-green-600" />
        <StatCard icon={Clock}     label="Pending"      value={pending}          color="bg-amber-100 text-amber-600" />
      </div>

      {/* Dept cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.bg} ${d.text} flex-shrink-0`}>
                  <Building2 size={18} />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${d.bg} ${d.text} ${d.border}`}>
                  {d.id}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-3 leading-tight">{d.name}</h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{d.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{d.active}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${d.pending > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                    {d.pending}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
              </div>

              {/* Staff bar */}
              {total > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Share of staff</span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {Math.round((d.total / total) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${d.bg.replace("100", "500")}`}
                      style={{ width: `${Math.round((d.total / total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {d.total === 0 && (
                <p className="text-xs text-muted-foreground/60 mt-2 text-center">No staff assigned</p>
              )}
            </div>
          ))}
      </div>

      {/* Unassigned users */}
      {unassigned.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Unassigned / Other Department</h3>
            <p className="text-xs text-muted-foreground">{unassigned.length} user(s) with unknown department</p>
          </div>
          <div className="divide-y divide-border">
            {unassigned.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                  {(u.firstName?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-muted-foreground">{u.department || "No department"}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.status === "Active"   ? "bg-green-100 text-green-700" :
                  u.status === "Pending"  ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
