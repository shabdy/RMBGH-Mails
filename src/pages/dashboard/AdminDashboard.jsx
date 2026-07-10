import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Inbox,
  Send,
  Megaphone,
  FileText,
  ArrowRight,
  Building2,
  Plus,
  ClipboardList,
  ShieldHalf,
  Paperclip,
} from "lucide-react";
import { getAllUsers } from "@/services/accountsService";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { AuthContext } from "@/context/authContext";

/* ── Stat card (no-action variant for read-only counts) ─────────────── */
function StatCard({ icon: Icon, title, value, subtitle, iconBg, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 text-left w-full
                 ${onClick ? "hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          <Icon size={18} />
        </div>
        {onClick && (
          <ArrowRight
            size={14}
            className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5"
          />
        )}
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
    </Tag>
  );
}

/* ── Member row — read-only, no actions ─────────────────────────────── */
function MemberRow({ user }) {
  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const statusColor =
    user.status === "Active"
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
      : user.status === "Pending"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        : "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
        {initials || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {user.email}
        </p>
      </div>
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
      >
        {user.status}
      </span>
    </div>
  );
}

/* ── Mail row ──────────────────────────────────────────────────────── */
function MailRow({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 border-t border-border first:border-0 hover:bg-muted/30 cursor-pointer"
    >
      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
        {(item.title || "?")[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate">
          {item.title}
        </p>
        <p className="text-[10px] text-muted-foreground">{item.sender}</p>
      </div>
      {item.unread && (
        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
      )}
    </div>
  );
}

/* ── Quick action button ───────────────────────────────────────────── */
function ActionItem({ icon: Icon, label, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors w-full text-left"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <ArrowRight
        size={13}
        className="ml-auto text-muted-foreground/40 flex-shrink-0"
      />
    </button>
  );
}

/* ── Main ──────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { unreadCount, drafts, sent, inbox, allAttachments } =
    useAnnouncements();

  const [deptUsers, setDeptUsers] = useState([]);
  const [deptCounts, setDeptCounts] = useState({ total: 0, active: 0 });

  const myDeptId = user?.departmentId;
  const myDept = user?.department || "Your Department";

  useEffect(() => {
    getAllUsers().then((users) => {
      // Only show members of this department, excluding the admin themselves
      const mine = users.filter(
        (u) => u.departmentId === myDeptId && u.id !== user?.id,
      );
      setDeptUsers(mine);
      setDeptCounts({
        total: mine.length,
        active: mine.filter((u) => u.status === "Active").length,
      });
    });
  }, [myDeptId, user?.id]);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Department-targeted mail addressed TO this department
  const deptMail = inbox
    .filter(
      (m) =>
        m.recipientType === "department" && m.targetDepartmentId === myDeptId,
    )
    .slice(0, 5);
  const recentInbox = inbox.slice(0, 5);

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* ── Hero ── */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {weekday}, {today}
          </p>
          <h1 className="text-xl font-bold text-foreground">
            Welcome back, {user?.firstName || "Admin"} !
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <ShieldHalf size={13} className="text-purple-500" />
            Head of Department · {myDept}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => navigate("/inbox")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold shadow hover:bg-blue-600 transition-colors"
          >
            <Megaphone size={12} /> {unreadCount} unread
          </button>
        )}
      </div>

      {/* ── Department member counts (read-only, no links to user management) ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={14} className="text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {myDept} — Department Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* No onClick — read-only stat */}
          <StatCard
            title="Total Members"
            value={deptCounts.total}
            iconBg="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
            icon={Users}
          />
          <StatCard
            title="Active Members"
            value={deptCounts.active}
            iconBg="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
            icon={UserCheck}
          />
          <StatCard
            title="Unread Mail"
            value={unreadCount || 0}
            iconBg="bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400"
            icon={Inbox}
            onClick={() => navigate("/inbox")}
          />
          <StatCard
            title="Dept Mail"
            value={deptMail.length}
            iconBg="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
            icon={Building2}
            onClick={() => navigate("/inbox")}
          />
        </div>
      </div>

      {/* ── Mail activity row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Sent"
          value={sent?.length || 0}
          iconBg="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
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
          title="Total Inbox"
          value={inbox?.length || 0}
          iconBg="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
          icon={Inbox}
          onClick={() => navigate("/inbox")}
        />
        <StatCard
          title="Attachments"
          value={allAttachments?.length || 0}
          iconBg="bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400"
          icon={Paperclip}
          onClick={() => navigate("/attachments")}
        />
      </div>

      {/* ── Two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: members + recent inbox */}
        <div className="lg:col-span-2 space-y-5">
          {/* Department members — read-only, no Manage button */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                {myDept} Members
              </h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {deptCounts.total} people
              </span>
            </div>
            {deptUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-1">
                <Users className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-xs font-medium">
                  No other members in this department
                </p>
              </div>
            ) : (
              <div>
                {deptUsers.slice(0, 8).map((u) => (
                  <MemberRow key={u.id} user={u} />
                ))}
                {deptUsers.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{deptUsers.length - 8} more members
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent inbox */}
          {recentInbox.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Inbox
                </h3>
                <button
                  onClick={() => navigate("/inbox")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              {recentInbox.map((m) => (
                <MailRow
                  key={m.id}
                  item={m}
                  onClick={() => navigate("/inbox")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: compose + quick actions + dept mail */}
        <div className="space-y-4">
          {/* Compose */}
          <button
            onClick={() => navigate("/inbox", { state: { openCompose: true } })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                       bg-primary text-primary-foreground text-sm font-semibold
                       hover:opacity-90 transition-opacity shadow"
          >
            <Plus size={16} /> Compose Mail
          </button>

          {/* Quick actions — no user management */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Quick Actions
            </h3>
            <div className="space-y-0.5">
              <ActionItem
                icon={Inbox}
                label="My Inbox"
                sub="View received messages"
                color="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                onClick={() => navigate("/inbox")}
              />
              <ActionItem
                icon={Send}
                label="Sent Mail"
                sub="Messages you've sent"
                color="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
                onClick={() => navigate("/sent")}
              />
              <ActionItem
                icon={Megaphone}
                label="Announcements"
                sub="View all broadcasts"
                color="bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400"
                onClick={() => navigate("/admin/announcements")}
              />
              <ActionItem
                icon={ClipboardList}
                label="Audit Log"
                sub="Department activity log"
                color="bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400"
                onClick={() => navigate("/admin/audit")}
              />
            </div>
          </div>

          {/* Dept mail */}
          {deptMail.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Dept. Mail
                  </h3>
                  <p className="text-[10px] text-muted-foreground">{myDept}</p>
                </div>
                <button
                  onClick={() => navigate("/inbox")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  All
                </button>
              </div>
              {deptMail.map((m) => (
                <MailRow
                  key={m.id}
                  item={m}
                  onClick={() => navigate("/inbox")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
