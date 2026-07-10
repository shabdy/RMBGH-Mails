import { useNavigate } from "react-router-dom";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { MailOpen, Pin } from "lucide-react";

const DEPT_COLORS = {
  "Administration":         { dot: "bg-yellow-500",  text: "text-yellow-700 dark:text-yellow-400" },
  "Human Resources":        { dot: "bg-purple-500",  text: "text-purple-700 dark:text-purple-400" },
  "Information Technology": { dot: "bg-blue-500",    text: "text-blue-700 dark:text-blue-400" },
  "Nursing":                { dot: "bg-pink-500",    text: "text-pink-700 dark:text-pink-400" },
  "Laboratory":             { dot: "bg-green-500",   text: "text-green-700 dark:text-green-400" },
  "Pharmacy":               { dot: "bg-teal-500",    text: "text-teal-700 dark:text-teal-400" },
  "Radiology":              { dot: "bg-cyan-500",    text: "text-cyan-700 dark:text-cyan-400" },
  "Finance":                { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  "Security":               { dot: "bg-slate-400",   text: "text-slate-700 dark:text-slate-400" },
};
const DEFAULT_DEPT_COLOR = { dot: "bg-gray-400", text: "text-gray-700 dark:text-gray-400" };

/* ── Shared panel shell — header with divider + "View all" action ──── */
function Panel({ title, action, children }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ViewAllLink({ onClick }) {
  return (
    <button onClick={onClick} className="text-xs text-primary font-medium hover:underline flex-shrink-0">
      View all
    </button>
  );
}

function DeptBadge({ dept }) {
  const c = DEPT_COLORS[dept] || DEFAULT_DEPT_COLOR;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium mt-1 ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {dept}
    </span>
  );
}

function AnnouncementItem({ item, onClick }) {
  const preview = item.content
    ? item.content.replace(/<[^>]*>/g, "").slice(0, 60) + "…"
    : "No content";

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 ring-1 ring-border flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold mt-0.5">
        {(item.title || "?")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-tight truncate">{item.title}</p>
          {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
        </div>
        {item.senderDept && <DeptBadge dept={item.senderDept} />}
        <p className="text-xs text-muted-foreground mt-1 truncate">{preview}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{item.date} · {item.time}</p>
      </div>
    </button>
  );
}

export function RecentAnnouncements() {
  const { inbox } = useAnnouncements();
  const navigate  = useNavigate();

  const recent = inbox.slice(0, 4);

  return (
    <Panel title="Recent Announcements" action={<ViewAllLink onClick={() => navigate("/inbox")} />}>
      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
          <MailOpen className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-xs">No announcements yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((a) => (
            <AnnouncementItem key={a.id} item={a} onClick={() => navigate("/inbox")} />
          ))}
        </div>
      )}
    </Panel>
  );
}

export function PinnedAnnouncements() {
  const { inbox, pinnedIds } = useAnnouncements();
  const navigate = useNavigate();
  const pinned   = inbox.filter((m) => pinnedIds.includes(m.id)).slice(0, 4);

  return (
    <Panel
      title={
        <span className="flex items-center gap-1.5">
          <Pin size={13} className="text-amber-500" />
          Pinned Announcements
        </span>
      }
      action={<ViewAllLink onClick={() => navigate("/inbox")} />}
    >
      {pinned.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No pinned announcements.</p>
      ) : (
        <div className="divide-y divide-border">
          {pinned.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate("/inbox")}
              className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 ring-1 ring-border flex items-center justify-center flex-shrink-0 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-xs font-bold mt-0.5">
                {(p.title || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-tight truncate">{p.title}</p>
                {p.senderDept && <DeptBadge dept={p.senderDept} />}
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{p.date}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}