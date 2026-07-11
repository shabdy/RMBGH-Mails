import { useState } from "react";
import { FileText, Download, Clock, MailOpen, Tag, Trash2, Eye, Users, Forward, PenLine, CheckCircle2 } from "lucide-react";
import { DeleteModal } from "../../inbox/components/DeleteModal";
import { ReadReceiptsModal } from "../../inbox/components/ReadReceiptModal";
import { RecipientsModal } from "../../inbox/components/RecipientsModal";
import { ForwardModal } from "../../inbox/components/ForwardModal";

const STATUS_CONFIG = {
  delivered: { label: "Delivered", class: "bg-green-50 text-green-600 border border-green-200" },
  pending:   { label: "Pending",   class: "bg-amber-50 text-amber-600 border border-amber-200" },
  failed:    { label: "Failed",    class: "bg-red-50 text-red-500 border border-red-200" },
};

function SeenByIndicator({ readBy, onClick }) {
  const count = readBy?.length || 0;
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition group">
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

function AcknowledgmentCard({ ack }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-background border border-border rounded-xl">
      {/* Signature thumbnail */}
      <div className="shrink-0 w-28 h-14 border border-border rounded-lg overflow-hidden bg-white flex items-center justify-center">
        {ack.signature ? (
          <img src={ack.signature} alt="signature" className="w-full h-full object-contain" />
        ) : (
          <PenLine size={16} className="text-muted-foreground/40" />
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-6 gap-y-1">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Received by</p>
          <p className="text-sm font-semibold text-foreground truncate">{ack.name}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Department</p>
          <p className="text-sm text-foreground truncate">{ack.dept}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Date</p>
          <p className="text-sm text-foreground">{ack.date}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Time</p>
          <p className="text-sm text-foreground">{ack.time}</p>
        </div>
      </div>
      {/* Badge */}
      <div className="shrink-0 flex items-center gap-1 text-[11px] text-green-600 font-medium">
        <CheckCircle2 size={13} /> Acknowledged
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name || "?").split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

function isFileLike(file) {
  return file && typeof file === "object" && typeof file.size === "number";
}

function AttachmentCard({ attachment }) {
  if (!attachment) return null;

  const isObj = isFileLike(attachment);
  const name = isObj ? (attachment.name || "Attachment") : String(attachment);
  const size = isObj && attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(1)} MB` : "File";

  const handleDownload = (e) => {
    e.stopPropagation();
    if (isObj) {
      const url = URL.createObjectURL(attachment);
      const a = document.createElement("a");
      a.href = url; a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const a = document.createElement("a");
      a.href = "/uploads/" + name; a.download = name; a.click();
    }
  };

  const handlePreview = () => {
    if (isObj) {
      const url = URL.createObjectURL(attachment);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } else {
      window.open("/uploads/" + name, "_blank");
    }
  };

  return (
    <div onClick={handlePreview} className="inline-flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-xl hover:border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition group cursor-pointer">
      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
        <FileText size={15} className="text-red-500" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-800">{name}</span>
        <span className="text-[10px] text-muted-FOREGROUND">{size}</span>
      </div>
      <button onClick={handleDownload} className="ml-4 p-1.5 text-muted-FOREGROUND group-hover:text-blue-500 transition">
        <Download size={14} />
      </button>
    </div>
  );
}

function RecipientDisplay({ recipients, recipientLabel, onShowAll }) {
  if (Array.isArray(recipients) && recipients.length > 0 && typeof recipients[0] === "object") {
    const SHOW = 3;
    const shown = recipients.slice(0, SHOW);
    const overflow = recipients.length - SHOW;
    return (
      <div className="flex items-center gap-1 text-xs text-muted-FOREGROUND flex-wrap">
        <Users size={11} className="shrink-0" />
        <span className="text-muted-FOREGROUND mr-0.5">To:</span>
        {shown.map((r, i) => (
          <span key={r?.id || i} className="text-foreground font-medium">
            {r?.name || "Unknown"}{i < shown.length - 1 ? "," : ""}
          </span>
        ))}
        {overflow > 0 && (
          <button onClick={onShowAll}
            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-semibold hover:bg-blue-200 transition">
            +{overflow} more
          </button>
        )}
      </div>
    );
  }
  const label = recipientLabel
    || (recipients === "all" ? "All Employees"
      : typeof recipients === "string" ? recipients
      : "My Department");
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-FOREGROUND">
      <Users size={11} />
      <span className="text-muted-FOREGROUND">To:</span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}

export function SentDetail({ selected, onDelete, currentUser }) {
  const [showDelete, setShowDelete]         = useState(false);
  const [showReceipts, setShowReceipts]     = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showForward, setShowForward]       = useState(false);

  if (!selected) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <MailOpen className="h-9 w-9 text-slate-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-FOREGROUND">No mail selected</p>
        <p className="text-xs text-muted-FOREGROUND mt-1">Select a sent mail from the list to view it here</p>
      </div>
    </div>
  );

  const status = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.delivered;

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">

      {/* TOOLBAR */}
      <div className="shrink-0 px-6 py-3 bg-background border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={"text-[11px] font-semibold px-2.5 py-1 rounded-full " + status.class}>{status.label}</span>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-FOREGROUND">
            <Tag size={11} /> {selected.emailTypeLabel}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForward(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-muted rounded-lg transition">
            <Forward size={13} /> Forward
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg transition">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-8 py-8">
          <h2 className="text-2xl font-semibold text-foreground leading-tight mb-6">{selected.title}</h2>
          <div className="flex items-start gap-3 pb-5 border-b border-border">
            <Avatar name={selected.sender || "You"} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{selected.sender}</span>
                  {selected.senderDept && (
                    <span className="text-[11px] text-muted-FOREGROUND truncate">· {selected.senderDept}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-FOREGROUND shrink-0">
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
              [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-FOREGROUND [&_blockquote]:italic [&_blockquote]:mb-4
              [&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-3 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:mb-4
              [&_a]:text-blue-600 [&_a]:underline
              [&_strong]:font-bold [&_em]:italic [&_u]:underline"
            dangerouslySetInnerHTML={{
              __html: selected.content?.startsWith("<")
                ? selected.content
                : `<p>${(selected.content || "").replace(/\n/g, "<br/>")}</p>`
            }}
          />
          {selected.attachment && (
            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Attachment</p>
              <AttachmentCard attachment={selected.attachment} />
            </div>
          )}

          {/* ACKNOWLEDGMENTS */}
          {selected.requiresReceipt && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  Acknowledgment Receipts
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  (selected.acknowledgments || []).length > 0
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {(selected.acknowledgments || []).length} received
                </span>
              </div>
              {(selected.acknowledgments || []).length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground">
                  <PenLine size={15} className="text-muted-foreground/50 shrink-0" />
                  No one has acknowledged this mail yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {(selected.acknowledgments || []).map((ack, i) => (
                    <AcknowledgmentCard key={i} ack={ack} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-16 pt-6 border-t border-border text-[11px] text-muted-foreground/40 text-center">End of message</div>
        </div>
      </div>

      <DeleteModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={onDelete} title={selected.title} />
      <ReadReceiptsModal open={showReceipts} onClose={() => setShowReceipts(false)} readBy={selected.readBy} />
      <RecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={selected.recipients} />
      <ForwardModal open={showForward} onClose={() => setShowForward(false)} selected={selected} currentUser={currentUser} />
    </div>
  );
}