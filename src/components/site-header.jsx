import { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, BellOff, MessageCircle, CornerDownRight, Heart, Pin, Megaphone, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { useNotifications } from "@/context/NotificationsContext";

const PAGE_TITLES = {
  "/dashboard":            "Dashboard",
  "/inbox":                "Announcements",
  "/sent":                 "Sent Mail",
  "/forward":              "Forwarded",
  "/attachments":          "Attachments",
  "/drafts":               "Drafts",
  "/admin/users":          "User Management",
  "/admin/audit":          "Audit Log",
  "/admin/departments":    "Departments",
  "/admin/reports":        "Reports & Analytics",
  "/admin/announcements":  "Announcements Hub",
  "/profile":              "My Profile",
  "/settings":             "Settings",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotifItem({ item, onClick }) {
  const letter  = (item.title || "?")[0].toUpperCase();
  const preview = (item.content || "").replace(/<[^>]*>/g, "").slice(0, 58);
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer
                 transition-colors border-b border-border last:border-0"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold
                      flex items-center justify-center flex-shrink-0 mt-0.5">
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold text-foreground leading-tight truncate">{item.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(item.date)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.sender}</p>
        {preview && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-1">{preview}</p>
        )}
      </div>
      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
    </div>
  );
}

const ACTIVITY_ICON = {
  post:    Megaphone,
  event:   CalendarDays,
  comment: MessageCircle,
  reply:   CornerDownRight,
  react:   Heart,
  pin:     Pin,
};

function ActivityNotifItem({ item, onClick }) {
  const Icon = ACTIVITY_ICON[item.type] || Megaphone;
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer
                 transition-colors border-b border-border last:border-0"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs leading-tight ${item.read ? "text-muted-foreground" : "text-foreground font-semibold"}`}>{item.message}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(item.date)}</span>
        </div>
      </div>
      {!item.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
    </div>
  );
}

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const { pathname }        = useLocation();
  const navigate            = useNavigate();
  const { unreadCount, inbox, markAllRead } = useAnnouncements();
  const {
    notifications: activityNotifs,
    unreadCount: activityUnreadCount,
    markRead: markActivityRead,
    markAllRead: markAllActivityRead,
  } = useNotifications();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState("mail"); // "mail" | "activity"
  const notifRef = useRef(null);

  const unreadMails = inbox.filter(m => m.unread).slice(0, 6);
  const title  = PAGE_TITLES[pathname] || "Portal";
  const isDark = theme === "dark";

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleViewAll = () => {
    navigate("/inbox");
    setNotifOpen(false);
  };

  const handleOpenMail = (mail) => {
    navigate("/inbox", { state: { mailId: mail.id } });
    setNotifOpen(false);
  };

  const handleOpenActivity = (n) => {
    if (!n.read) markActivityRead(n.id);
    if (n.postId) navigate("/announcements", { state: { postId: n.postId } });
    setNotifOpen(false);
  };

  const totalUnread = unreadCount + activityUnreadCount;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background
                       transition-[width,height] ease-linear
                       group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-semibold text-foreground">{title}</h1>

        <div className="ml-auto flex items-center gap-0.5">

          {/* ── Notification bell ── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              title="Notifications"
            >
              <Bell size={18} className="text-muted-foreground" />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500
                                  text-white text-[9px] font-bold rounded-full flex items-center
                                  justify-center leading-none pointer-events-none">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border
                              rounded-xl shadow-2xl z-50 overflow-hidden">

                {/* Header + tabs */}
                <div className="border-b border-border">
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    {(notifTab === "mail" ? unreadCount : activityUnreadCount) > 0 && (
                      <button
                        onClick={notifTab === "mail" ? handleMarkAllRead : markAllActivityRead}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 px-3 pb-2">
                    <button
                      onClick={() => setNotifTab("mail")}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition ${
                        notifTab === "mail" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Mail {unreadCount > 0 && <span>({unreadCount})</span>}
                    </button>
                    <button
                      onClick={() => setNotifTab("activity")}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition ${
                        notifTab === "activity" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Activity {activityUnreadCount > 0 && <span>({activityUnreadCount})</span>}
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {notifTab === "mail" ? (
                    unreadMails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                        <BellOff size={28} className="text-muted-foreground/30" />
                        <p className="text-xs font-medium">You're all caught up!</p>
                        <p className="text-[11px] text-muted-foreground/60">No new mail</p>
                      </div>
                    ) : (
                      unreadMails.map(m => (
                        <NotifItem key={m.id} item={m} onClick={() => handleOpenMail(m)} />
                      ))
                    )
                  ) : (
                    activityNotifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                        <BellOff size={28} className="text-muted-foreground/30" />
                        <p className="text-xs font-medium">You're all caught up!</p>
                        <p className="text-[11px] text-muted-foreground/60">No new activity</p>
                      </div>
                    ) : (
                      activityNotifs.slice(0, 12).map(n => (
                        <ActivityNotifItem key={n.id} item={n} onClick={() => handleOpenActivity(n)} />
                      ))
                    )
                  )}
                </div>

                {/* Footer */}
                {notifTab === "mail" && (
                  <div className="border-t border-border px-4 py-2.5 bg-muted/20">
                    <button
                      onClick={handleViewAll}
                      className="w-full text-xs text-primary font-medium hover:underline text-center block"
                    >
                      View all in Inbox →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Dark / Light toggle ── */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark
              ? <Sun  size={18} className="text-muted-foreground" />
              : <Moon size={18} className="text-muted-foreground" />}
          </button>
        </div>
      </div>
    </header>
  );
}
