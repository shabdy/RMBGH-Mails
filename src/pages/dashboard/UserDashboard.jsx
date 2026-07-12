import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Send,
  FileText,
  Paperclip,
  Plus,
  Building2,
  Pin,
  MailOpen,
  Globe,
  Bell,
} from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { useAnnouncements } from "@/context/AnnouncementContext";

/* ── helpers ──────────────────────────────────────────────────────── */
const DEPT_COLORS = {
  Administration:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
  "Human Resources":
    "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "Information Technology":
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Nursing: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  Laboratory:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Pharmacy: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  Radiology: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  Finance:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

function AnnouncementRow({ item, onClick }) {
  const deptClass =
    DEPT_COLORS[item.senderDept] ||
    "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400";
  const preview = (item.content || "").replace(/<[^>]*>/g, "").slice(0, 80);
  const letter = (item.title || "?")[0].toUpperCase();
  const typeIcon =
    item.recipientType === "all" ? (
      <Globe size={10} />
    ) : item.recipientType === "department" ? (
      <Building2 size={10} />
    ) : null;

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0
                 hover:bg-muted/30 cursor-pointer transition-colors group"
    >
      <div
        className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center
                      flex-shrink-0 text-primary text-sm font-bold mt-0.5"
      >
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {item.unread && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
            <p
              className={`text-sm font-semibold truncate ${item.unread ? "text-foreground" : "text-foreground/80"}`}
            >
              {item.title}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {item.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">{item.sender}</span>
          {item.senderDept && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium ${deptClass}`}
            >
              {typeIcon} {item.senderDept}
            </span>
          )}
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {preview}
          </p>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3
                 hover:shadow-md transition-all hover:border-primary/20 text-left w-full"
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </button>
  );
}

/* ── main ─────────────────────────────────────────────────────────── */
export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    inbox,
    unreadCount,
    drafts,
    sent,
    allAttachments,
    pinnedIds,
    currentUser,
  } = useAnnouncements();

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const unread = inbox.filter((m) => m.unread);
  const pinned = inbox.filter((m) => pinnedIds.includes(m.id)).slice(0, 5);
  const recent = inbox.filter((m) => !m.unread).slice(0, 6);
  const deptMails = inbox
    .filter(
      (m) =>
        m.recipientType === "department" &&
        m.targetDepartmentId === currentUser?.departmentId,
    )
    .slice(0, 4);

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Hi, {user?.firstName || "there"} !
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentUser?.department ? `${currentUser.department} · ` : ""}
            {weekday}, {today}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => navigate("/inbox")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold shadow hover:bg-blue-600 transition-colors"
          >
            <Bell size={12} /> {unreadCount} unread
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill
          label="Unread"
          value={unreadCount || 0}
          icon={Inbox}
          color="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
          onClick={() => navigate("/inbox")}
        />
        <StatPill
          label="Sent"
          value={sent?.length || 0}
          icon={Send}
          color="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
          onClick={() => navigate("/sent")}
        />
        <StatPill
          label="Drafts"
          value={drafts?.length || 0}
          icon={FileText}
          color="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          onClick={() => navigate("/drafts")}
        />
        <StatPill
          label="Attachments"
          value={allAttachments?.length || 0}
          icon={Paperclip}
          color="bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400"
          onClick={() => navigate("/attachments")}
        />
      </div>

      {/* ── Two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Announcement feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Unread */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Unread Announcements
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate("/inbox")}
                className="text-xs text-primary font-medium hover:underline"
              >
                View all
              </button>
            </div>
            {unread.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <MailOpen className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-xs font-medium">You're all caught up!</p>
                <p className="text-xs text-muted-foreground/60">
                  No unread announcements.
                </p>
              </div>
            ) : (
              unread
                .slice(0, 6)
                .map((a) => (
                  <AnnouncementRow
                    key={a.id}
                    item={a}
                    onClick={() => navigate("/inbox")}
                  />
                ))
            )}
          </div>

          {/* Recently read */}
          {recent.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Recently Read
                </h3>
                <button
                  onClick={() => navigate("/inbox")}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              {recent.map((a) => (
                <AnnouncementRow
                  key={a.id}
                  item={a}
                  onClick={() => navigate("/inbox")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: sidebar */}
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

          {/* Pinned */}
          {pinned.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-1.5">
                  <Pin size={12} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Pinned
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/inbox")}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  All
                </button>
              </div>
              <div className="px-4 pb-3 space-y-1">
                {pinned.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate("/inbox")}
                    className="flex items-center gap-2.5 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/20 rounded px-1"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-400 text-xs font-bold flex-shrink-0">
                      {(p.title || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dept mail */}
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  My Department
                </h3>
                {currentUser?.department && (
                  <p className="text-[10px] text-muted-foreground">
                    {currentUser.department}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate("/inbox")}
                className="text-xs text-primary font-medium hover:underline"
              >
                View all
              </button>
            </div>
            <div className="px-4 pb-3">
              {deptMails.length === 0 ? (
                <div className="py-6 text-center">
                  <Building2 className="w-7 h-7 mb-1.5 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    No department announcements
                  </p>
                </div>
              ) : (
                deptMails.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate("/inbox")}
                    className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/20 rounded px-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                      <Building2 size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {m.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.sender} · {m.date}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1.5">
              {[
                {
                  label: "View Inbox",
                  icon: Inbox,
                  onClick: () => navigate("/inbox"),
                  color:
                    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
                },
                {
                  label: "View Sent",
                  icon: Send,
                  onClick: () => navigate("/sent"),
                  color:
                    "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
                },
                {
                  label: "Drafts",
                  icon: FileText,
                  onClick: () => navigate("/drafts"),
                  color:
                    "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
                },
                {
                  label: "Attachments",
                  icon: Paperclip,
                  onClick: () => navigate("/attachments"),
                  color:
                    "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
                },
              ].map(({ label, icon: Icon, onClick, color }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
                  >
                    <Icon size={13} />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
