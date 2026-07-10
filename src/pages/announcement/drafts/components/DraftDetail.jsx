import { MailOpen, FileEdit, Trash2, Clock, Users, FileText, Download } from "lucide-react";

function Avatar({ name }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

function isFileLike(file) {
  return file && typeof file === "object" && typeof file.size === "number";
}

function AttachmentCard({ attachment }) {
  const handlePreview = () => {
    if (isFileLike(attachment)) {
      const url = URL.createObjectURL(attachment);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } else {
      window.open(`/uploads/${attachment}`, "_blank");
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (isFileLike(attachment)) {
      const url = URL.createObjectURL(attachment);
      const a = document.createElement("a");
      a.href = url; a.download = attachment.name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const a = document.createElement("a");
      a.href = `/uploads/${attachment}`; a.download = attachment; a.click();
    }
  };

  const name = isFileLike(attachment) ? attachment.name : attachment;
  const size = isFileLike(attachment) ? `${(attachment.size / 1024 / 1024).toFixed(1)} MB` : "File";

  return (
    <div
      onClick={handlePreview}
      className="inline-flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition group cursor-pointer"
    >
      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
        <FileText size={15} className="text-red-500" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-800">{name}</span>
        <span className="text-[10px] text-slate-400">{size}</span>
      </div>
      <button
        onClick={handleDownload}
        className="ml-4 p-1.5 text-slate-400 group-hover:text-blue-500 transition"
        title="Download"
      >
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
      <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap">
        <Users size={11} className="shrink-0" />
        <span className="text-slate-400 mr-0.5">To:</span>
        {shown.map((r, i) => (
          <span key={r?.id || i} className="text-slate-700 font-medium">
            {r?.name || "Unknown"}{i < shown.length - 1 ? "," : ""}
          </span>
        ))}
        {overflow > 0 && (
          <button
            onClick={onShowAll}
            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-semibold hover:bg-blue-200 transition"
          >
            +{overflow} more
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Users size={11} />
      <span className="text-slate-400">To:</span>
      {recipientLabel
        ? <span className="text-slate-700">{recipientLabel}</span>
        : <span className="italic text-slate-300">Not set</span>}
    </div>
  );
}

export function DraftDetail({ selected, onEdit, onDelete, onShowRecipients }) {
  if (!selected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <MailOpen className="h-9 w-9 text-slate-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">No draft selected</p>
          <p className="text-xs text-slate-400 mt-1">Select a draft to view or continue editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">

      {/* TOOLBAR */}
      <div className="shrink-0 px-6 py-3 bg-white border-b flex items-center justify-between">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-500">
          Draft
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(selected)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <FileEdit size={13} /> Continue Editing
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-8 py-8">

          {/* TITLE */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
              {selected.title}
            </h2>
            <span className="shrink-0 mt-1 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-amber-50 text-amber-500 border border-amber-200">
              Draft
            </span>
          </div>

          {/* SENDER ROW */}
          <div className="flex items-start gap-3 pb-5 border-b border-slate-200">
            <Avatar name={selected.sender || "You"} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 truncate">{selected.sender || "You"}</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                  <Clock size={11} /> Last saved {selected.date} · {selected.time}
                </div>
              </div>
              <div className="mt-0.5">
                <RecipientDisplay
                  recipients={selected.recipients}
                  recipientLabel={selected.recipientLabel}
                  onShowAll={onShowRecipients}
                />
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {selected.content ? (
            <div
              className="mt-6 text-sm leading-7 text-slate-700
                [&_p]:mb-4
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                [&_li]:mb-1
                [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:text-slate-500 [&_blockquote]:italic [&_blockquote]:mb-4
                [&_pre]:bg-slate-100 [&_pre]:rounded [&_pre]:p-3 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:mb-4
                [&_a]:text-blue-600 [&_a]:underline
                [&_strong]:font-bold [&_em]:italic [&_u]:underline"
              dangerouslySetInnerHTML={{
                __html: selected.content?.startsWith("<")
                  ? selected.content
                  : (selected.content || "")
                      .split(/\n\s*\n/)
                      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
                      .join("")
              }}
            />
          ) : (
            <span className="italic text-slate-300 text-sm mt-6 block">No content yet</span>
          )}

          {selected.attachment && (
            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Attachment</p>
              <AttachmentCard attachment={selected.attachment} />
            </div>
          )}

          <div className="mt-16 pt-6 border-t border-slate-200 text-[11px] text-slate-300 text-center">
            Draft — not yet sent
          </div>

        </div>
      </div>
    </div>
  );
}