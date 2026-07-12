import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getUsers, activateUser, rejectUser } from "@/services/accountsService";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
];

function Avatar({ name }) {
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const color    = AVATAR_COLORS[(name || "").charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export default function PendingUsersTable() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState({});

  const load = async () => {
    setLoading(true);
    const data = await getUsers();          /* already filtered to status=Pending */
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleActivate = async (id) => {
    setBusy((b) => ({ ...b, [id]: "activate" }));
    try {
      await activateUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setBusy((b) => { const c = { ...b }; delete c[id]; return c; });
    }
  };

  const handleReject = async (id) => {
    setBusy((b) => ({ ...b, [id]: "reject" }));
    try {
      await rejectUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setBusy((b) => { const c = { ...b }; delete c[id]; return c; });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Pending User Registrations</h3>
          {users.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
              {users.length}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading pending users…</span>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-1">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs">No pending registrations right now.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-border bg-muted/40">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Department</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isBusy   = !!busy[user.id];
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                return (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={fullName || "?"} />
                        <span className="font-medium text-foreground">{fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{user.department || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30">
                        Pending
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleActivate(user.id)}
                            title="Approve"
                            className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 font-medium text-xs px-2 py-1 rounded bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            title="Reject"
                            className="flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 font-medium text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
