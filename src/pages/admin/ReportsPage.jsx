import { useState, useEffect } from "react";
import {
  Users, UserCheck, Clock, Megaphone, FileText,
  Inbox, Send, Pin, TrendingUp, BarChart3, Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { getAllUsers } from "@/services/accountsService";
import { useAnnouncements } from "@/context/AnnouncementContext";
import UserRegistrationChart, {
  UsersByDepartmentChart,
  AnnouncementActivityChart,
} from "../dashboard/components/DashboardCharts";

function Stat({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function PillBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-6 text-right">{value}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [users, setUsers] = useState([]);
  const { inbox, sent, drafts, forwarded, pinnedIds } = useAnnouncements();

  useEffect(() => {
    getAllUsers().then(u => setUsers(u));
  }, []);

  const totalUsers    = users.length;
  const activeUsers   = users.filter(u => u.status === "Active").length;
  const pendingUsers  = users.filter(u => u.status === "Pending").length;
  const inactiveUsers = users.filter(u => u.status === "Inactive").length;

  /* Mail breakdown by recipient type */
  const allMails       = [...inbox, ...sent];
  const specificMails  = allMails.filter(m => m.recipientType === "specific").length;
  const deptMails      = allMails.filter(m => m.recipientType === "department").length;
  const broadcastMails = allMails.filter(m => m.recipientType === "all").length;

  /* Dept distribution */
  const deptCounts = users.reduce((acc, u) => {
    const dept = u.department || "Unknown";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const topDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxDept  = Math.max(...topDepts.map(([, c]) => c), 1);

  const BAR_COLORS = [
    "bg-blue-400", "bg-purple-400", "bg-pink-400",
    "bg-green-400", "bg-amber-400", "bg-teal-400",
  ];

  /* ── Excel export ─────────────────────────────────────────────────── */
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    /* Sheet 1 — Summary */
    const summaryRows = [
      ["RMBGH Mailing System — Reports Summary"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["USERS", ""],
      ["Total Users",    totalUsers],
      ["Active Users",   activeUsers],
      ["Pending Users",  pendingUsers],
      ["Inactive Users", inactiveUsers],
      [],
      ["MAIL", ""],
      ["Total Inbox",    inbox.length],
      ["Total Sent",     sent.length],
      ["Drafts",         drafts.length],
      ["Forwarded",      forwarded.length],
      ["Pinned",         pinnedIds.length],
      [],
      ["MAIL TYPE BREAKDOWN", ""],
      ["Direct (Specific)", specificMails],
      ["Department-wide",   deptMails],
      ["Broadcast (All)",   broadcastMails],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
    ws1["!cols"] = [{ wch: 26 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    /* Sheet 2 — Staff by Department */
    const deptRows = [
      ["Department", "Staff Count", "% of Total"],
      ...topDepts.map(([dept, count]) => [
        dept,
        count,
        totalUsers > 0 ? `${Math.round((count / totalUsers) * 100)}%` : "0%",
      ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(deptRows);
    ws2["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Staff by Dept");

    /* Sheet 3 — User List */
    const userRows = [
      ["Name", "Email", "Department", "Role", "Status", "Joined"],
      ...users.map(u => [
        `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        u.email,
        u.department || "—",
        u.role,
        u.status,
        u.createdAt || "—",
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(userRows);
    ws3["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws3, "User List");

    XLSX.writeFile(wb, `RMBGH_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">System-wide statistics and activity overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <TrendingUp size={12} />
            Live data
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-primary text-primary-foreground hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Download size={13} />
            Download Excel
          </button>
        </div>
      </div>

      {/* User stats */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users size={13} /> User Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Users}     label="Total Users"    value={totalUsers}    color="bg-blue-100 text-blue-600" />
          <Stat icon={UserCheck} label="Active"         value={activeUsers}   color="bg-green-100 text-green-600"  sub={totalUsers > 0 ? `${Math.round((activeUsers/totalUsers)*100)}% of total` : ""} />
          <Stat icon={Clock}     label="Pending"        value={pendingUsers}  color="bg-amber-100 text-amber-600"  sub={pendingUsers > 0 ? "Awaiting approval" : "None pending"} />
          <Stat icon={Users}     label="Inactive"       value={inactiveUsers} color="bg-slate-100 text-slate-600" />
        </div>
      </div>

      {/* Mail stats */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Megaphone size={13} /> Mail Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Inbox}    label="Total Inbox"   value={inbox.length}     color="bg-blue-100 text-blue-600"   />
          <Stat icon={Send}     label="Total Sent"    value={sent.length}      color="bg-green-100 text-green-600" />
          <Stat icon={FileText} label="Drafts"        value={drafts.length}    color="bg-amber-100 text-amber-600" />
          <Stat icon={Pin}      label="Pinned"        value={pinnedIds.length} color="bg-red-100 text-red-600"     />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UserRegistrationChart users={users} />
        <UsersByDepartmentChart users={users} />
      </div>

      {/* Bottom row: dept staff + mail type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Staff by department bar */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Staff by Department</h3>
          </div>
          <div className="space-y-3">
            {topDepts.map(([dept, count], i) => (
              <PillBar key={dept} label={dept} value={count} max={maxDept} color={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
            {topDepts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No department data</p>
            )}
          </div>
        </div>

        {/* Mail type breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Mail Type Breakdown</h3>
          </div>
          <div className="space-y-3">
            <PillBar label="Direct (Specific)" value={specificMails}  max={allMails.length || 1} color="bg-blue-400" />
            <PillBar label="Department-wide"   value={deptMails}      max={allMails.length || 1} color="bg-purple-400" />
            <PillBar label="Broadcast (All)"   value={broadcastMails} max={allMails.length || 1} color="bg-green-400" />
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Direct",    value: specificMails,  color: "text-blue-600" },
              { label: "Dept-wide", value: deptMails,      color: "text-purple-600" },
              { label: "Broadcast", value: broadcastMails, color: "text-green-600" },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcement activity chart */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <TrendingUp size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Mail Activity</h3>
        </div>
        <AnnouncementActivityChart mails={allMails} />
      </div>
    </div>
  );
}
