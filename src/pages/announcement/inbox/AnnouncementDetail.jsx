import { useState, useRef, useEffect } from "react";
import { FileText, Download, Forward, Trash2, MoreHorizontal, Clock, Users, Pin, MailOpen, Eye, EyeOff, AlertCircle, CheckCheck } from "lucide-react";
import { ForwardModal } from "../inbox/components/ForwardModal";
import { DeleteModal } from "../inbox/components/DeleteModal";
import { ReadReceiptsModal } from "../inbox/components/ReadReceiptModal";
import { RecipientsModal } from "../inbox/components/RecipientsModal";
import { useAnnouncements } from "../../../context/AnnouncementContext";

const PRIORITY_CONFIG = {
  urgent:    { label: "Urgent",    class: "bg-red-50 text-red-600 border border-red-200" },
  important: { label: "Important", class: "bg-amber-50 text-amber-600 border border-amber-200" },
  normal:    { label: "Normal",    class: "bg-muted text-muted-foreground border border-border" },
};

function Avatar({ name }) {
  const initials = (name || "?").split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

function SeenByIndicator({ readBy, onClick }) {
  const count = readBy?.length || 0;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition group"
    >
      {count > 0 ? (
        <>
          <div className="flex items-center -space-x-1.5">
            {readBy.slice(0, 3).map((r, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-semibold border-2 border-background transition"
                title={r.name}
              >
                {(r.name || "?").split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?"}
              </div>
            ))}
          </div>
          <span>Seen by {count}</span>
        </>
      ) : (
        <>
          <Eye size={12} className="text-muted-foreground/40" />
          <span>Not yet seen</span>
        </>
      )}
    </button>
  );
}

function isFileLike(file) {
  return file && typeof file === "object" && typeof file.size === "number";
}

function AttachmentCard({ attachment }) {
  const handleDownload = (e) => {
    e.stopPropagation();
    if (isFileLike(attachment)) {
      const url = URL.createObjectURL(attachment);
      const a = document.createElement("a");
      a.href = url; a.download = attachment.name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const a = document.createElement("a");
      a.href = `/uploads/${attachment}`;
      a.download = attachment;
      a.click();
    }
  };

  const handlePreview = () => {
    if (isFileLike(attachment)) {
      const url = URL.createObjectURL(attachment);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } else {
      window.open(`/uploads/${attachment}`, "_blank");
    }
  };

  const name = isFileLike(attachment) ? attachment.name : attachment;
  const size = isFileLike(attachment) ? `${(attachment.size / 1024 / 1024).toFixed(1)} MB` : "PDF Document";

  return (
    <div
      onClick={handlePreview}
      className="inline-flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-xl hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition group cursor-pointer"
    >
      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
        <FileText size={15} className="text-red-500" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="text-[10px] text-muted-foreground">{size}</span>
      </div>
      <button
        onClick={handleDownload}
        className="ml-4 p-1.5 text-muted-foreground group-hover:text-blue-500 transition"
        title="Download"
      >
        <Download size={14} />
      </button>
    </div>
  );
}

// ── DROPDOWN MENU (3 dots) ─────────────────────────────────────────────────────
function MoreMenu({ selected, onMarkRead, onMarkUnread, onToggleUrgent, isUrgent, onViewReceipts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-xl shadow-lg py-1.5 z-50">
          {selected.unread ? (
            <button
              onClick={() => { onMarkRead(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:text-foreground transition"
            >
              <Eye size={15} className="text-muted-foreground" /> Mark as Read
            </button>
          ) : (
            <button
              onClick={() => { onMarkUnread(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:text-foreground transition"
            >
              <EyeOff size={15} className="text-muted-foreground" /> Mark as Unread
            </button>
          )}

          <button
            onClick={() => { onToggleUrgent(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:text-foreground transition"
          >
            <AlertCircle size={15} className={isUrgent ? "text-red-500" : "text-muted-foreground"} />
            {isUrgent ? "Remove Urgent" : "Mark as Urgent"}
          </button>

          <div className="h-px bg-border my-1" />

          <button
            onClick={() => { onViewReceipts(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:text-foreground transition"
          >
            <CheckCheck size={15} className="text-muted-foreground" /> Read Receipts
          </button>
        </div>
      )}
    </div>
  );
}

// ── RECIPIENT DISPLAY ─────────────────────────────────────────────────────────
function RecipientDisplay({ recipients, recipientLabel, onShowAll }) {
  // New format — array of employee objects
  if (Array.isArray(recipients) && recipients.length > 0 && typeof recipients[0] === "object") {
    const SHOW = 3;
    const shown = recipients.slice(0, SHOW);
    const overflow = recipients.length - SHOW;
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
        <Users size={11} className="shrink-0" />
        <span className="text-muted-foreground mr-0.5">To:</span>
        {shown.map((r, i) => (
          <span key={r?.id || i} className="bg-muted/30 font-medium">
            {r?.name || "Unknown"}{i < shown.length - 1 ? "," : ""}
          </span>
        ))}
        {overflow > 0 && (
          <button
            onClick={onShowAll}
            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-semibold hover:bg-blue-200 transition"
            title="View all recipients"
          >
            +{overflow} more
          </button>
        )}
      </div>
    );
  }

  // Legacy string format — "all", "IT", etc. or plain label
  const label = recipientLabel
    || (recipients === "all" ? "All Employees"
      : typeof recipients === "string" ? recipients
      : "My Department");

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Users size={11} />
      <span className="text-muted-foreground">To:</span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}

export function AnnouncementDetail({ selected, isPinned, onTogglePin, onDelete, currentUser }) {
  const { markRead, markUnread, toggleImportant, importantIds } = useAnnouncements();
  const isUrgentOverride = importantIds.includes(selected?.id);
  const [showForward, setShowForward]       = useState(false);
  const [showDelete, setShowDelete]         = useState(false);
  const [showReceipts, setShowReceipts]     = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);

  if (!selected) return (
    <div className="flex-1 flex flex-col items-center justify-center text-foreground gap-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <MailOpen className="h-9 w-9 text-muted-foreground/40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No announcement selected</p>
        <p className="text-xs text-muted-foreground mt-1">Select an announcement from the list to view it here</p>
      </div>
    </div>
  );

  const priority = PRIORITY_CONFIG[selected.priority] ?? PRIORITY_CONFIG.normal;
  const isImportant = importantIds.includes(selected.id);

  return (
    <div className="flex-1 flex flex-col text-foreground overflow-hidden">

      {/* TOOLBAR */}
      <div className="shrink-0 px-6 py-3 bg-background border-b flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForward(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition">
            <Forward size={13} /> Forward
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition">
            <Trash2 size={13} /> Delete
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${
              isPinned ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-muted-foreground hover:bg-muted"
            }`}>
            <Pin size={13} className={isPinned ? "fill-amber-400" : ""} />
            {isPinned ? "Pinned" : "Pin"}
          </button>

          <MoreMenu
            selected={selected}
            isUrgent={isUrgentOverride}
            onMarkRead={() => markRead(selected.id)}
            onMarkUnread={() => markUnread(selected.id)}
            onToggleUrgent={() => toggleImportant(selected.id)}
            onViewReceipts={() => setShowReceipts(true)}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-8 py-8">

          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {isPinned && <Pin size={14} className="text-amber-400 fill-amber-400 shrink-0 mt-1" />}
              {isUrgentOverride && <AlertCircle size={14} className="text-red-500 shrink-0 mt-1" />}
              <h2 className="text-2xl font-semibold text-foreground leading-tight">{selected.title}</h2>
            </div>
            <span className={`shrink-0 mt-1 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${priority.class}`}>
              {priority.label}
            </span>
          </div>

          <div className="flex items-start gap-3 pb-5 border-b border-border">
            <Avatar name={selected.sender} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{selected.sender}</span>
                  {selected.senderDept && (
                    <span className="text-[11px] text-muted-foreground truncate">· {selected.senderDept}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Clock size={11} /> {selected.date} · {selected.time}
                </div>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <RecipientDisplay recipients={selected.recipients} recipientLabel={selected.recipientLabel} onShowAll={() => setShowRecipients(true)} />
                <SeenByIndicator readBy={selected.readBy} onClick={() => setShowReceipts(true)} />
              </div>
            </div>
          </div>

          <div
            className="mt-6 text-sm leading-7 text-foreground
              [&_p]:mb-4
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
              [&_li]:mb-1
              [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:mb-4
              [&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-3 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:mb-4
              [&_a]:text-blue-600 [&_a]:underline
              [&_strong]:font-bold [&_em]:italic [&_u]:underline"
            dangerouslySetInnerHTML={{
              __html: selected.content?.startsWith("<")
                ? selected.content
                : `<p>${(selected.content || "").replace(/\n/g, "<br/>")}</p>`
            }}
          />

          {selected.attachment && (typeof selected.attachment === "string" || isFileLike(selected.attachment)) && (
            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Attachment</p>
              <AttachmentCard attachment={selected.attachment} />
            </div>
          )}

          <div className="mt-16 pt-6 border-t border-border text-[11px] text-muted-foreground/40 text-center">
            End of message
          </div>

        </div>
      </div>

      <ForwardModal open={showForward} onClose={() => setShowForward(false)} selected={selected} currentUser={currentUser} />
      <DeleteModal  open={showDelete}  onClose={() => setShowDelete(false)}  onConfirm={onDelete} title={selected.title} />
      <ReadReceiptsModal open={showReceipts} onClose={() => setShowReceipts(false)} readBy={selected.readBy} />
      <RecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={selected.recipients} />

    </div>
  );
}