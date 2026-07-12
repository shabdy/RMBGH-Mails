import { useState, useEffect, useMemo, useContext } from "react";
import {
  Search, UserCheck, UserX, Trash2, Shield,
  Users, Clock, Building2, ChevronDown, X, Loader2,
  CheckCircle, XCircle, Edit2, Eye, EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllUsers, activateUser, rejectUser } from "@/services/accountsService";
import { AuthContext } from "@/context/authContext";
import { toast } from "sonner";
import axios from "axios";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { getRoleConfig } from "@/config/roleConfig";

const api = axios.create({ baseURL: "/api" });

async function logAudit(performedBy, action, targetUser, details) {
  try {
    await api.post("/audit", { performedBy, action, targetUser, details });
  } catch { /* silent */ }
}

const DEPARTMENTS = [
  "All Departments",
  "Administration", "Human Resources", "Information Technology",
  "Nursing", "Laboratory", "Pharmacy", "Radiology",
  "Surgery", "Medical Records", "Finance", "Maintenance", "Security",
];

const STATUS_CONFIG = {
  Active:   { label: "Active",   class: "bg-green-50 text-green-700 border-green-200" },
  Pending:  { label: "Pending",  class: "bg-amber-50 text-amber-700 border-amber-200" },
  Inactive: { label: "Inactive", class: "bg-muted text-muted-foreground border-border" },
};

const DEPT_MAP = {
  "Administration":         "ADMIN",
  "Human Resources":        "HR",
  "Information Technology": "IT",
  "Nursing":                "NUR",
  "Laboratory":             "LAB",
  "Pharmacy":               "PHARM",
  "Radiology":              "RAD",
  "Surgery":                "SURG",
  "Medical Records":        "MEDREC",
  "Finance":                "FIN",
  "Maintenance":            "MAINT",
  "Security":               "SEC",
};

function Avatar({ name, src, size = "md" }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const COLORS   = [
    "bg-blue-500","bg-violet-500","bg-green-500","bg-amber-500",
    "bg-pink-500","bg-teal-500","bg-red-500","bg-indigo-500",
  ];
  const color = COLORS[(name || "").charCodeAt(0) % COLORS.length];
  const sz    = size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  if (src) {
    return <img src={src} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz} ${color} rounded-full text-white flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-background border rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ── Edit / View Modal ───────────────────────────────────────────────── */
function UserModal({ user, onClose, onSaved, isSuperAdmin }) {
  const [role,       setRole]       = useState(user.role       || "user");
  const [status,     setStatus]     = useState(user.status     || "Pending");
  const [department, setDepartment] = useState(user.department || "");
  const [saving,     setSaving]     = useState(false);

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch = { role, status };
      if (isSuperAdmin && department) {
        patch.department   = department;
        patch.departmentId = DEPT_MAP[department] || user.departmentId || "";
      }
      const { data } = await api.patch(`/users/${user.id}`, patch);
      toast.success("User updated successfully");
      onSaved(data);
      onClose();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const EDITABLE_DEPTS = Object.keys(DEPT_MAP);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-foreground">Edit User</h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition">
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
            <Avatar name={fullName} src={user.profileImage} size="lg" />
            <div>
              <p className="font-semibold text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">{department || user.department || "No department"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {isSuperAdmin && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EDITABLE_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">Staff</option>
                <option value="admin">Admin (Head of Dept)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/40">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[80px]">
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ─────────────────────────────────────────────── */
function DeleteModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Delete User?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{fullName}</span> will be permanently removed.
              This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleConfirm} disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════ MAIN PAGE ══════════════════════════════ */
export default function UsersPage() {
  const { user: adminUser } = useContext(AuthContext);
  const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "Admin";

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter,   setDeptFilter]   = useState("All Departments");
  const [editUser,     setEditUser]     = useState(null);
  const [deleteUser,   setDeleteUser]   = useState(null);
  const [busy,         setBusy]         = useState({});
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total:   users.length,
    active:  users.filter(u => u.status === "Active").length,
    pending: users.filter(u => u.status === "Pending").length,
    depts:   new Set(users.map(u => u.departmentId).filter(Boolean)).size,
  }), [users]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const name = `${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || u.status === statusFilter;
      const matchDept   = deptFilter === "All Departments" || u.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [users, search, statusFilter, deptFilter]);

  useEffect(() => setPage(1), [search, statusFilter, deptFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const doActivate = async (id) => {
    setBusy(b => ({ ...b, [id]: "activate" }));
    try {
      const updated = await activateUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
      const target = users.find(u => u.id === id);
      const targetName = target ? `${target.firstName} ${target.lastName}` : String(id);
      const wasNew = target?.status === "Pending";
      await logAudit(adminName, wasNew ? "approve" : "activate", targetName,
        wasNew ? `Approved new account for ${targetName}` : `Reactivated account for ${targetName}`);
    } finally { setBusy(b => { const c = {...b}; delete c[id]; return c; }); }
  };

  const doDeactivate = async (id) => {
    setBusy(b => ({ ...b, [id]: "deactivate" }));
    try {
      const { data } = await api.patch(`/users/${id}`, { status: "Inactive" });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
      const target = users.find(u => u.id === id);
      const targetName = target ? `${target.firstName} ${target.lastName}` : String(id);
      toast.success("User deactivated");
      await logAudit(adminName, "deactivate", targetName, `Deactivated account for ${targetName}`);
    } finally { setBusy(b => { const c = {...b}; delete c[id]; return c; }); }
  };

  const doReject = async (id) => {
    setBusy(b => ({ ...b, [id]: "reject" }));
    try {
      const target = users.find(u => u.id === id);
      const targetName = target ? `${target.firstName} ${target.lastName}` : String(id);
      await rejectUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      await logAudit(adminName, "reject", targetName, `Rejected registration for ${targetName} (${target?.email})`);
    } finally { setBusy(b => { const c = {...b}; delete c[id]; return c; }); }
  };

  const doDelete = async (id) => {
    const target = users.find(u => u.id === id);
    const targetName = target ? `${target.firstName} ${target.lastName}` : String(id);
    await rejectUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteUser(null);
    await logAudit(adminName, "delete", targetName, `Permanently deleted account for ${targetName} (${target?.email})`);
  };

  const onSaved = async (updated) => {
    const prev = users.find(u => u.id === updated.id);
    setUsers(list => list.map(u => u.id === updated.id ? { ...u, ...updated } : u));
    const targetName = `${updated.firstName} ${updated.lastName}`;
    if (prev?.role !== updated.role) {
      await logAudit(adminName, "role_change", targetName,
        `Changed role from ${prev?.role} to ${updated.role}`);
    }
    if (prev?.status !== updated.status) {
      await logAudit(adminName, "status_change", targetName,
        `Changed status from ${prev?.status} to ${updated.status}`);
    }
    if (prev?.department !== updated.department && updated.department) {
      await logAudit(adminName, "department_change", targetName,
        `Changed department from ${prev?.department || "none"} to ${updated.department}`);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-background">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage employee accounts and access levels</p>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total Users"   value={stats.total}   color="bg-blue-100 text-blue-600" />
        <StatCard icon={UserCheck} label="Active Users"  value={stats.active}  color="bg-green-100 text-green-600" />
        <StatCard icon={Clock}     label="Pending"       value={stats.pending} color="bg-amber-100 text-amber-600" />
        <StatCard icon={Building2} label="Departments"   value={stats.depts}   color="bg-purple-100 text-purple-600" />
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-background border rounded-xl px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-muted/50 text-xs">
          {["All", "Active", "Pending", "Inactive"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === s
                  ? "bg-background shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="h-9 pl-3 pr-8 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Users size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium">No users found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(user => {
                  const fullName  = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                  const isBusy    = !!busy[user.id];
                  const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.Pending;
                  const roleCfg   = getRoleConfig(user.role);

                  return (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      {/* Employee */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} src={user.profileImage} />
                          <div>
                            <p className="font-medium text-foreground">{fullName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Building2 size={13} className="text-muted-foreground/50 shrink-0" />
                          <span className="text-sm">{user.department || "—"}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border w-fit ${roleCfg.class}`}>
                            {roleCfg.label}
                          </span>
                          {user.role === "admin" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border w-fit bg-amber-50 text-amber-700 border-amber-200">
                              <Shield size={9} /> Head of Dept
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.class}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBusy ? (
                            <Loader2 size={14} className="animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {user.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => doActivate(user.id)}
                                    title="Approve"
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition"
                                  >
                                    <CheckCircle size={13} /> Approve
                                  </button>
                                  <button
                                    onClick={() => doReject(user.id)}
                                    title="Reject"
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                </>
                              )}

                              {user.status === "Active" && user.role !== "superadmin" && (
                                <button
                                  onClick={() => doDeactivate(user.id)}
                                  title="Deactivate"
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 border border-border transition"
                                >
                                  <EyeOff size={13} /> Deactivate
                                </button>
                              )}

                              {user.status === "Inactive" && (
                                <button
                                  onClick={() => doActivate(user.id)}
                                  title="Activate"
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                                >
                                  <Eye size={13} /> Activate
                                </button>
                              )}

                              <button
                                onClick={() => setEditUser(user)}
                                title="Edit"
                                className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                              >
                                <Edit2 size={14} />
                              </button>

                              {user.role !== "superadmin" && (
                                <button
                                  onClick={() => setDeleteUser(user)}
                                  title="Delete"
                                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar
          page={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      </div>

      {/* ── MODALS ── */}
      {editUser   && <UserModal user={editUser} onClose={() => setEditUser(null)} onSaved={onSaved} isSuperAdmin={adminUser?.role === "superadmin"} />}
      {deleteUser && <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={() => doDelete(deleteUser.id)} />}
    </div>
  );
}
