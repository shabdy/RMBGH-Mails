import { useState } from "react";
import { FileText, Download, Clock, MailOpen, CornerUpRight, Eye, Trash2 } from "lucide-react";
import { ReadReceiptsModal } from "../../inbox/components/ReadReceiptModal";
import { DeleteModal } from "../../inbox/components/DeleteModal";
import { RecipientsModal } from "../../inbox/components/RecipientsModal";
import { RecipientDisplay } from "../../inbox/components/RecipientDisplay";
import { useAnnouncements } from "../../../../context/AnnouncementContext";

const STATUS_CONFIG = {
  delivered: { label: "Delivered", class: "bg-green-50 text-green-600 border border-green-200" },
  pending:   { label: "Pending",   class: "bg-amber-50 text-amber-600 border border-amber-200" },
  failed:    { label: "Failed",    class: "bg-red-50 text-red-500 border border-red-200" },
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
    <button onClick={onClick} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition">
      {count > 0 ? (
        <>
          <div className="flex items-center -space-x-1.5">
            {(readBy || []).slice(0, 3).map((r, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-semibold border-2 border-background" title={r.name}>
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

export function ForwardDetail({ selected, onDelete }) {
  const { currentUser } = useAnnouncements();
  const [showReceipts, setShowReceipts]     = useState(false);
  const [showDelete, setShowDelete]         = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);

  if (!selected) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <MailOpen className="h-9 w-9 text-muted-foreground/40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">No mail selected</p>
        <p className="text-xs text-muted-foreground mt-1">Select a forwarded mail from the list to view it here</p>
      </div>
    </div>
  );

  const status = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.delivered;
  const isAll  = selected.forwardedTo === "all";
  const senderName = selected.sender || currentUser?.name;
  const senderDept = selected.senderDept || currentUser?.department;

  const handleAttachmentPreview = () => {
    const a = selected.attachment;
    if (!a) return;
    if (isFileLike(a)) {
      const url = URL.createObjectURL(a);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } else {
      window.open("/uploads/" + a, "_blank");
    }
  };

  const handleAttachmentDownload = (e) => {
    e.stopPropagation();
    const a = selected.attachment;
    if (!a) return;
    if (isFileLike(a)) {
      const url = URL.createObjectURL(a);
      const el = document.createElement("a");
      el.href = url; el.download = a.name; el.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const el = document.createElement("a");
      el.href = "/uploads/" + a; el.download = String(a); el.click();
    }
  };

  const attachName = selected.attachment
    ? (isFileLike(selected.attachment) ? selected.attachment.name : String(selected.attachment))
    : null;

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">

      {/* TOOLBAR */}
      <div className="shrink-0 px-6 py-3 bg-background border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CornerUpRight size={12} className="text-muted-foreground" />
            Forwarded from <span className="font-medium text-foreground">{selected.originalSender}</span>
          </div>
          <span className="text-muted-foreground/30">·</span>
          <span className={"text-[11px] font-semibold px-2.5 py-1 rounded-full " + status.class}>
            {status.label}
          </span>
        </div>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition">
          <Trash2 size={13} /> Delete
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-8 py-8">

          <h2 className="text-2xl font-semibold text-foreground leading-tight mb-6">
            {selected.title}
          </h2>

          {/* FORWARDED BY ROW */}
          <div className="flex items-start gap-3 pb-5 border-b border-border">
            <Avatar name={senderName} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{senderName}</span>
                  <span className="text-[11px] text-muted-foreground truncate">· {senderDept}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Clock size={11} /> {selected.date} · {selected.time}
                </div>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <RecipientDisplay
                  recipients={selected.forwardedTo}
                  recipientLabel={selected.forwardedToLabel}
                  onShowAll={() => setShowRecipients(true)}
                  label="Fwd to"
                />
                <SeenByIndicator readBy={selected.readBy} onClick={() => setShowReceipts(true)} />
              </div>
            </div>
          </div>

          {/* NOTE */}
          {selected.note && (
            <div className="mt-5 px-4 py-3 bg-muted/40 border border-border rounded-lg">
              <p className="text-[11px] uppercase tracking-widest text-foreground font-semibold mb-2">Note</p>
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: selected.note?.startsWith("<")
                    ? selected.note
                    : `<p>${(selected.note || "").replace(/\n/g, "<br/>")}</p>`
                }}
              />
            </div>
          )}

          {/* ORIGINAL MESSAGE */}
          <div className="mt-6 pl-4 border-l-2 border-border">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Original Message</p>
            <div
              className="text-sm leading-7 text-foreground
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
          </div>

          {/* ATTACHMENT */}
          {selected.attachment && (
            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Attachment</p>
              <div
                onClick={handleAttachmentPreview}
                className="inline-flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-xl hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition group cursor-pointer"
              >
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-red-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">{attachName}</span>
                  <span className="text-[10px] text-muted-foreground">File</span>
                </div>
                <button
                  onClick={handleAttachmentDownload}
                  className="ml-4 p-1.5 text-muted-foreground group-hover:text-blue-500 transition"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-16 pt-6 border-t border-border text-[11px] text-muted-foreground/40 text-center">
            End of message
          </div>

        </div>
      </div>

      <ReadReceiptsModal open={showReceipts} onClose={() => setShowReceipts(false)} readBy={selected.readBy} />
      <DeleteModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={onDelete} title={selected.title} />
      <RecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={selected.forwardedTo} />
    </div>
  );
}
