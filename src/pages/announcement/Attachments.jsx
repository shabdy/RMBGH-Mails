import { useMemo, useState } from "react";
import { useAnnouncements } from "../../context/AnnouncementContext";
import { FileText, FileImage, File, Download, Search, Inbox, Send, ArrowUpDown, X, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { DeleteModal } from "../announcement/inbox/components/DeleteModal";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getFileType(name) {
  if (!name || typeof name !== "string") return "other";
  const ext = name.split(".").pop().toLowerCase();
  if (["pdf"].includes(ext))                                return "pdf";
  if (["doc", "docx"].includes(ext))                       return "doc";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["xls", "xlsx"].includes(ext))                       return "excel";
  return "other";
}

function FileIcon({ name }) {
  const type = getFileType(name);
  if (type === "image") return <FileImage size={16} className="text-blue-500" />;
  if (type === "pdf")   return <FileText  size={16} className="text-red-500" />;
  if (type === "doc")   return <FileText  size={16} className="text-blue-600" />;
  if (type === "excel") return <FileText  size={16} className="text-green-600" />;
  return <File size={16} className="text-muted-foreground" />;
}

const TYPE_BADGE = {
  pdf:   { label: "PDF",   class: "bg-red-50 text-red-500 border border-red-100" },
  doc:   { label: "DOC",   class: "bg-blue-50 text-blue-600 border border-blue-100" },
  image: { label: "Image", class: "bg-purple-50 text-purple-500 border border-purple-100" },
  excel: { label: "Excel", class: "bg-green-50 text-green-600 border border-green-100" },
  other: { label: "File",  class: "bg-muted text-muted-foreground border border-border" },
};

function typeBadge(name) {
  return TYPE_BADGE[getFileType(name)] ?? TYPE_BADGE.other;
}

function isFileLike(file) {
  return file && typeof file === "object" && typeof file.size === "number";
}

function doDownload(e, file, name) {
  e.stopPropagation();
  if (isFileLike(file)) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } else {
    const a = document.createElement("a");
    a.href = "/uploads/" + name; a.download = name; a.click();
  }
}

// ── FILE VIEWER MODAL ─────────────────────────────────────────────────────────

function FileViewerModal({ item, onClose }) {
  if (!item) return null;
  const isFileObj = isFileLike(item.file);
  const url = isFileObj ? URL.createObjectURL(item.file) : `/uploads/${item.name}`;
  const type = getFileType(item.name);
  const isImage = type === "image";
  const isPdf   = type === "pdf";

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url; a.download = item.name; a.click();
    if (isFileObj) setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="!grid-rows-none !grid-cols-none !flex !flex-col !gap-0 !max-w-4xl !w-[90vw] !h-[90vh] !p-0 rounded-2xl overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-muted border flex items-center justify-center shrink-0">
              <FileIcon name={item.name} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-[11px] text-muted-foreground">{item.sender} · {item.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition">
              <Download size={13} /> Download
            </button>
            <button onClick={() => window.open(url, "_blank")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition">
              <ExternalLink size={13} /> Open
            </button>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 bg-muted flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img src={url} alt={item.name} className="max-w-full max-h-full object-contain" />
          ) : isPdf ? (
            <iframe src={url} title={item.name} className="w-full h-full border-none" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center">
                <FileIcon name={item.name} />
              </div>
              <p className="text-sm font-medium">Preview not available for this file type</p>
              <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                <Download size={14} /> Download to view
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── FILE TYPE TABS ────────────────────────────────────────────────────────────

const FILE_TYPE_TABS = [
  { key: "all",   label: "All" },
  { key: "pdf",   label: "PDF" },
  { key: "doc",   label: "DOC" },
  { key: "image", label: "Images" },
  { key: "excel", label: "Excel" },
  { key: "other", label: "Other" },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function Attachments() {
  const { allAttachments, deleteFromInbox, deleteFromSent } = useAnnouncements();

  const [search, setSearch]         = useState("");
  const [typeTab, setTypeTab]       = useState("all");
  const [source, setSource]         = useState("all");
  const [sortKey, setSortKey]       = useState("date");
  const [sortDir, setSortDir]       = useState("desc");
  const [viewItem, setViewItem]     = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let data = allAttachments;
    if (typeTab !== "all") data = data.filter((a) => getFileType(a.name) === typeTab);
    if (source !== "all")  data = data.filter((a) => a.source === source);
    if (search) data = data.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.sender.toLowerCase().includes(search.toLowerCase()) ||
      a.mailTitle.toLowerCase().includes(search.toLowerCase())
    );
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name")   cmp = a.name.localeCompare(b.name);
      if (sortKey === "sender") cmp = a.sender.localeCompare(b.sender);
      if (sortKey === "date")   cmp = new Date(a.date) - new Date(b.date);
      if (sortKey === "type")   cmp = getFileType(a.name).localeCompare(getFileType(b.name));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [allAttachments, typeTab, source, search, sortKey, sortDir]);

  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    if (deleteItem.source === "sent") deleteFromSent(deleteItem.mailId);
    else deleteFromInbox(deleteItem.mailId);
    setDeleteItem(null);
  };

  function SortHead({ label, colKey }) {
    const active = sortKey === colKey;
    return (
      <button
        onClick={() => toggleSort(colKey)}
        className={"flex items-center gap-1 hover:text-foreground transition " + (active ? "text-foreground font-semibold" : "text-muted-foreground")}
      >
        {label}
        <ArrowUpDown size={12} className={active ? "text-blue-500" : "text-muted-foreground/40"} />
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* PAGE HEADER */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between bg-background border-b">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Attachments</h1>
          <p className="text-xs text-muted-foreground">All files from sent and received announcements</p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {filtered.length} file{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* FILTERS */}
      <div className="shrink-0 px-6 py-3 bg-background border-b flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search files, sender..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {[{ key: "all", label: "All" }, { key: "received", label: "Received" }, { key: "sent", label: "Sent" }].map((s) => (
            <button key={s.key} onClick={() => setSource(s.key)}
              className={"px-3 py-1 text-xs rounded-md transition " + (source === s.key ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* FILE TYPE TABS */}
      <div className="shrink-0 px-6 flex gap-0 bg-background border-b overflow-x-auto">
        {FILE_TYPE_TABS.map((t) => (
          <button key={t.key} onClick={() => setTypeTab(t.key)}
            className={"px-4 py-2.5 text-xs transition whitespace-nowrap " +
              (typeTab === t.key ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <File size={28} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium">No attachments found</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[36px]" />
                <TableHead><SortHead label="File Name" colKey="name" /></TableHead>
                <TableHead><SortHead label="Type"      colKey="type" /></TableHead>
                <TableHead><SortHead label="Sender"    colKey="sender" /></TableHead>
                <TableHead>Announcement</TableHead>
                <TableHead>Source</TableHead>
                <TableHead><SortHead label="Date"      colKey="date" /></TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const badge = typeBadge(item.name);
                return (
                  <TableRow key={item.id} onClick={() => setViewItem(item)} className="cursor-pointer hover:bg-muted/50 group">
                    <TableCell>
                      <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                        <FileIcon name={item.name} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px] block">{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full " + badge.class}>{badge.label}</span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{item.sender}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px] block">{item.mailTitle}</span>
                    </TableCell>
                    <TableCell>
                      {item.source === "sent" ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                          <Send size={9} /> Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                          <Inbox size={9} /> Received
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.date} · {item.time}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => { e.stopPropagation(); doDownload(e, item.file, item.name); }}
                          className="p-1.5 text-muted-foreground/50 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
                          className="p-1.5 text-muted-foreground/50 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <FileViewerModal item={viewItem} onClose={() => setViewItem(null)} />

      <DeleteModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title={deleteItem?.name}
      />
    </div>
  );
}
