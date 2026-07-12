import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Clock,
  Building2,
  Megaphone,
  FileText,
  ClipboardList,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Globe,
  Send,
  Activity,
  ChevronRight,
} from "lucide-react";
import UserRegistrationChart, {
  UsersByDepartmentChart,
  AnnouncementActivityChart,
} from "./components/DashboardCharts";
import PendingUsersTable from "./components/PendingUsersTable";
import { getAllUsers } from "@/services/accountsService";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { AuthContext } from "@/context/authContext";

/* ── Stat card (unchanged) ────────────────────────────────────────── */
function StatCard({ icon: Icon, title, value, subtitle, iconBg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md
                 hover:border-primary/20 transition-all group w-full"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          <Icon size={18} />
        </div>
        <ArrowRight
          size={14}
          className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5"
        />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs font-medium text-muted-foreground mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
}

/* ── Section heading (unchanged) ─────────────────────────────────────*/
function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-muted-foreground" />
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </h2>
    </div>
  );
}

/* ── Shared panel shell — gives every side-panel the same
     header / divider / padding rhythm ─────────────────────────────── */
function Panel({
  icon: Icon,
  title,
  action,
  children,
  noBodyPadding,
  className = "",
}) {
  return (
    <div
  className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full ${className}`}
>
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-muted-foreground" />}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
     <div className={`${noBodyPadding ? "" : "p-4"} flex-1`}>{children}</div>
    </div>
  );
}

/* ── Admin Actions ─────────────────────────────────────────────────
   Redesigned: icon chip keeps its accent color but sits inside a
   cleaner row with a visible hover affordance and tighter rhythm.  */
function ActionItem({ icon: Icon, label, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/70
                 transition-colors w-full text-left group"
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <ChevronRight
        size={15}
        className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0"
      />
    </button>
  );
}

/* ── Users by Dept — colored bars tied to a fixed palette so it reads
     as a mini legend rather than a bare progress list ──────────────── */
const DEPT_ACCENTS = [
  { dot: "bg-blue-500", bar: "bg-blue-500" },
  { dot: "bg-emerald-500", bar: "bg-emerald-500" },
  { dot: "bg-amber-500", bar: "bg-amber-500" },
  { dot: "bg-purple-500", bar: "bg-purple-500" },
  { dot: "bg-slate-400", bar: "bg-slate-400" },
];

function DeptRow({ name, count, total, accent }) {
  const pct = Math.min(100, (count / Math.max(total, 1)) * 100 * 3);
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${accent.dot}`} />
        <p className="text-xs font-medium text-foreground truncate flex-1 min-w-0">{name}</p>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{count}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${accent.bar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Recent Mail row — avatar + tighter typographic hierarchy ────────*/
function MailRow({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-muted/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
        {(item.title || "?")[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{item.sender}</p>
      </div>
      {item.unread && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
      )}
    </button>
  );
}

/* ── Main ──────────────────────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { unreadCount, drafts, sent, pinnedIds, inbox, forwarded } =
    useAnnouncements();

  const [allUsers, setAllUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({
    total: 0,
    active: 0,
    pending: 0,
    depts: 0,
  });

  useEffect(() => {
    getAllUsers().then((users) => {
      setAllUsers(users);
      const depts = new Set(users.map((u) => u.departmentId).filter(Boolean));
      setUserCounts({
        total: users.length,
        active: users.filter((u) => u.status === "Active").length,
        pending: users.filter((u) => u.status === "Pending").length,
        depts: depts.size,
      });
    });
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const recent = inbox.slice(0, 5);

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-800 dark:to-slate-700 rounded-xl p-5 flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
            {weekday}, {today}
          </p>
          <h1 className="text-xl font-bold text-white">
            Welcome, {user?.firstName || "Super Admin"} !
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            {user?.position || "System Administrator"} · {user?.department || "Administration"}
          </p>
        </div>
        <div className="hidden md:flex gap-2 flex-wrap justify-end">
          {userCounts.pending > 0 && (
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow hover:bg-amber-600 transition-colors"
            >
              <Clock size={12} /> {userCounts.pending} pending
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={() => navigate("/inbox")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold shadow hover:bg-blue-600 transition-colors"
            >
              <Megaphone size={12} /> {unreadCount} unread
            </button>
          )}
        </div>
      </div>

      {/* ── User stats ── */}
      <div>
        <SectionLabel icon={Users} label="Organization Overview" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Users"
            value={userCounts.total}
            iconBg="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
            icon={Users}
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            title="Active Users"
            value={userCounts.active}
            iconBg="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
            icon={UserCheck}
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            title="Pending"
            value={userCounts.pending}
            iconBg="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
            icon={Clock}
            onClick={() => navigate("/admin/users")}
            subtitle={userCounts.pending > 0 ? "Needs review" : "All approved"}
          />
          <StatCard
            title="Departments"
            value={userCounts.depts}
            iconBg="bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400"
            icon={Building2}
            onClick={() => navigate("/admin/departments")}
          />
        </div>
      </div>

      {/* ── Mail stats ── */}
      <div>
        <SectionLabel icon={Megaphone} label="System Mail Overview" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Sent"
            value={sent?.length || 0}
            iconBg="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
            icon={Send}
            onClick={() => navigate("/sent")}
          />
          <StatCard
            title="Drafts"
            value={drafts?.length || 0}
            iconBg="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
            icon={FileText}
            onClick={() => navigate("/drafts")}
          />
          <StatCard
            title="Unread Inbox"
            value={unreadCount || 0}
            iconBg="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
            icon={Megaphone}
            onClick={() => navigate("/inbox")}
          />
          <StatCard
            title="Forwarded"
            value={forwarded?.length || 0}
            iconBg="bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400"
            icon={Globe}
            onClick={() => navigate("/forward")}
          />
        </div>
      </div>

      {/* ── Charts + Actions + Recent ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left: charts — wrapper only; internal chart layout lives in
            DashboardCharts.jsx, share that file for a full pass on these */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <UserRegistrationChart users={allUsers} />
          <UsersByDepartmentChart users={allUsers} />
        </div>

        {/* Right: actions + recent */}
<div className="grid grid-rows-2 gap-4 h-[660px]">

  {/* Admin Actions */}
  <Panel icon={ClipboardList} title="Admin Actions">
    <div className="-mx-1 space-y-0.5">
      <ActionItem
        icon={Users}
        label="Manage Users"
        sub="Approve, assign roles & depts"
        color="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        onClick={() => navigate("/admin/users")}
      />

      <ActionItem
        icon={Building2}
        label="Departments"
        sub="Manage org departments"
        color="bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400"
        onClick={() => navigate("/admin/departments")}
      />

      <ActionItem
        icon={BarChart3}
        label="Reports"
        sub="Usage & activity reports"
        color="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
        onClick={() => navigate("/admin/reports")}
      />

      <ActionItem
        icon={ClipboardList}
        label="Audit Log"
        sub="Track all admin actions"
        color="bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400"
        onClick={() => navigate("/admin/audit")}
      />
    </div>
  </Panel>

  {/* Recent Mail */}
  {recent.length > 0 && (
    <Panel
      icon={Send}
      title="Recent Mail"
      action={
        <button
          onClick={() => navigate("/inbox")}
          className="text-xs text-primary hover:underline font-medium"
        >
          View all
        </button>
      }
      noBodyPadding
    >
      <div className="divide-y divide-border h-full overflow-y-auto">
        {recent.map((m) => (
          <MailRow
            key={m.id}
            item={m}
            onClick={() => navigate("/inbox")}
          />
        ))}
      </div>
    </Panel>
  )}
</div>
      </div>

      {/* ── Pending users ── */}
      <PendingUsersTable />

      {/* ── Activity chart ── */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <Activity size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Announcement Activity
          </h3>
        </div>
        <AnnouncementActivityChart mails={[...inbox, ...sent]} />
      </div>
    </div>
  );
}