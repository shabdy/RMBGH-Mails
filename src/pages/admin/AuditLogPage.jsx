import { useState, useEffect, useMemo } from "react";
import {
  Search, ClipboardList, ChevronDown,
  Shield, UserCheck, UserX, Trash2, Edit2, EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import api from "@/services/apiClient";

const ACTION_CONFIG = {
  approve:      { label: "Approved",      icon: UserCheck, class: "bg-green-50 text-green-700 border-green-200"    },
  reject:       { label: "Rejected",      icon: UserX,     class: "bg-red-50 text-red-700 border-red-200"          },
  deactivate:   { label: "Deactivated",   icon: EyeOff,    class: "bg-muted text-muted-foreground border-border"   },
  activate:     { label: "Activated",     icon: UserCheck, class: "bg-blue-50 text-blue-700 border-blue-200"       },
  role_change:  { label: "Role Changed",  icon: Edit2,     class: "bg-purple-50 text-purple-700 border-purple-200" },
  delete:       { label: "Deleted",       icon: Trash2,    class: "bg-red-50 text-red-600 border-red-200"          },
  status_change:{ label: "Status Changed",icon: Shield,    class: "bg-amber-50 text-amber-700 border-amber-200"    },
  edit:         { label: "Edited",        icon: Edit2,     class: "bg-blue-50 text-blue-700 border-blue-200"       },
};

const PAGE_SIZE = 10;

function AvatarBadge({ name }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const COLORS   = ["bg-blue-500","bg-violet-500","bg-green-500","bg-amber-500","bg-pink-500","bg-teal-500"];
  const color    = COLORS[(name || "").charCodeAt(0) % COLORS.length];
  return (
    <div className={`w-7 h-7 rounded-full ${color} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

export default function AuditLogPage() {
  const [logs,         setLogs]         = useState([]);
  const [search,       setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [page,         setPage]         = useState(1);

  useEffect(() => {
    api.get("/audit")
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]));
  }, []);

  const allActions = useMemo(() => {
    const types = [...new Set(logs.map(l => l.action))];
    return ["All", ...types];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const text = `${l.performedBy} ${l.targetUser} ${l.details}`.toLowerCase();
      return text.includes(search.toLowerCase())
        && (actionFilter === "All" || l.action === actionFilter);
    });
  }, [logs, search, actionFilter]);

  useEffect(() => setPage(1), [search, actionFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-background">
      <div>
        <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Track all admin actions performed in the system</p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-background border rounded-xl px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user, action, or details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="h-9 pl-3 pr-8 border rounded-lg bg-background text-foreground text-sm focus:outline-none appearance-none cursor-pointer"
          >
            {allActions.map(a => (
              <option key={a} value={a}>
                {a === "All" ? "All Actions" : (ACTION_CONFIG[a]?.label || a)}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} entries</span>
      </div>

      {/* ── Table ── */}
      <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <ClipboardList size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium">No audit entries found</p>
            <p className="text-xs">Actions taken by admins will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timestamp</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Performed By</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(log => {
                  const cfg  = ACTION_CONFIG[log.action] || { label: log.action, icon: Shield, class: "bg-muted text-muted-foreground border-border" };
                  const Icon = cfg.icon;
                  const ts   = new Date(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        <p className="font-medium text-foreground">
                          {ts.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p>{ts.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <AvatarBadge name={log.performedBy} />
                          <span className="text-sm font-medium text-foreground">{log.performedBy}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.class}`}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <AvatarBadge name={log.targetUser} />
                          <span className="text-sm text-foreground">{log.targetUser}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground max-w-xs truncate">{log.details}</td>
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
    </div>
  );
}
