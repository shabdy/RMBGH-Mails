import { useState, useContext, useRef } from "react";
import {
  Send, Image as ImageIcon, Paperclip, X, FileText, Loader2, CalendarPlus, MapPin, Clock, CalendarDays,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2,
} from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { usePosts } from "@/context/PostsContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";

const MAX_FILES = 6;
const MAX_SIZE = 15 * 1024 * 1024;
const MAX_CHARS = 5000;
const CATEGORIES = ["Updates", "Events", "Policies", "Alerts"];

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// One accent per category — echoes the color bar used on the rendered
// PostCard, so the composer visibly previews the identity the post will
// carry once it's live in the feed.
const CATEGORY_ACCENT = {
  Updates:  { bar: "bg-sky-400",     text: "text-sky-600",     ring: "ring-sky-300",     tab: "border-sky-500 text-sky-600",     btn: "bg-sky-600 hover:bg-sky-700",     wash: "bg-sky-50" },
  Events:   { bar: "bg-violet-400",  text: "text-violet-600",  ring: "ring-violet-300",  tab: "border-violet-500 text-violet-600", btn: "bg-violet-600 hover:bg-violet-700", wash: "bg-violet-50" },
  Policies: { bar: "bg-emerald-400", text: "text-emerald-600", ring: "ring-emerald-300", tab: "border-emerald-500 text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700", wash: "bg-emerald-50" },
  Alerts:   { bar: "bg-amber-400",   text: "text-amber-700",   ring: "ring-amber-300",   tab: "border-amber-500 text-amber-700",   btn: "bg-amber-600 hover:bg-amber-700",   wash: "bg-amber-50" },
};

function parseDatePreview(dateStr) {
  const [y, m, d] = (dateStr || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return { month: MONTHS_SHORT[m - 1], day: d };
}

export function PostComposer() {
  const { user } = useContext(AuthContext);
  const { createPost, uploadFiles } = usePosts();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Updates");
  const [files, setFiles] = useState([]); // { file, previewUrl, uploading? }
  const [focused, setFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [filingEvent, setFilingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const imgInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.Updates;
  const datePreview = parseDatePreview(eventDate);
  const expanded = focused || text || files.length > 0 || filingEvent;

  const eventReady = filingEvent ? eventTitle.trim().length > 0 && eventDate.trim().length > 0 : true;
  const canPost = (text.trim().length > 0 || files.length > 0 || filingEvent) && eventReady && !posting;

  const resetEvent = () => {
    setFilingEvent(false);
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
  };

  const addFiles = (list) => {
    const incoming = Array.from(list || []).filter((f) => f.size <= MAX_SIZE);
    const next = incoming.slice(0, Math.max(0, MAX_FILES - files.length)).map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      const copy = [...prev];
      if (copy[idx]?.previewUrl) URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  // ── Formatting helpers ──────────────────────────────────────────────
  // The textarea stays a plain <textarea>; these helpers insert
  // lightweight markdown-style syntax (**bold**, *italic*, etc.) around
  // the current selection, then restore focus/selection so typing can
  // continue right where the person left off.
  const resizeTextarea = (ta) => {
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  };

  const wrapSelection = (prefix, suffix = prefix, placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.slice(start, end) || placeholder;
    const newValue = text.slice(0, start) + prefix + selected + suffix + text.slice(end);
    setText(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      resizeTextarea(ta);
    });
  };

  const applyListFormat = (ordered) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = text.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = text.length;
    const block = text.slice(lineStart, lineEnd);
    const lines = block.length ? block.split("\n") : [""];
    const newBlock = lines.map((line, i) => (ordered ? `${i + 1}. ${line}` : `- ${line}`)).join("\n");
    const newValue = text.slice(0, lineStart) + newBlock + text.slice(lineEnd);
    setText(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + newBlock.length);
      resizeTextarea(ta);
    });
  };

  const applyLink = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.slice(start, end) || "link text";
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    const insert = `[${selected}](${url})`;
    const newValue = text.slice(0, start) + insert + text.slice(end);
    setText(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + insert.length, start + insert.length);
      resizeTextarea(ta);
    });
  };

  const TOOLBAR = [
    { icon: Bold,          title: "Bold (Ctrl+B)",      action: () => wrapSelection("**", "**", "bold text") },
    { icon: Italic,        title: "Italic (Ctrl+I)",    action: () => wrapSelection("*", "*", "italic text") },
    { icon: Underline,     title: "Underline (Ctrl+U)", action: () => wrapSelection("<u>", "</u>", "underlined text") },
    { icon: Strikethrough, title: "Strikethrough",      action: () => wrapSelection("~~", "~~", "struck text") },
    { icon: List,          title: "Bullet list",        action: () => applyListFormat(false) },
    { icon: ListOrdered,   title: "Numbered list",      action: () => applyListFormat(true) },
    { icon: Link2,         title: "Link",               action: applyLink },
  ];

  const handleTextareaKeyDown = (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") { e.preventDefault(); wrapSelection("**", "**", "bold text"); }
    else if (key === "i") { e.preventDefault(); wrapSelection("*", "*", "italic text"); }
    else if (key === "u") { e.preventDefault(); wrapSelection("<u>", "</u>", "underlined text"); }
  };
  // ─────────────────────────────────────────────────────────────────────

  const handlePost = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      let attachments = [];
      if (files.length > 0) {
        attachments = await uploadFiles(files.map((f) => f.file));
      }
      const event = filingEvent
        ? { title: eventTitle.trim(), date: eventDate, time: eventTime, location: eventLocation.trim() }
        : null;
      await createPost(text, attachments, category, event);
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      setText("");
      setFiles([]);
      setCategory("Updates");
      setFocused(false);
      resetEvent();
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className={`relative bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
        expanded ? "border-border shadow-md" : "border-border"
      }`}
    >
      {/* Category accent strip — same device as the rendered PostCard */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 transition-colors duration-300 ${accent.bar}`} />

      <div className="pl-4 pr-4 pt-3.5 pb-4">
        {/* Eyebrow */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
            <span className={`w-1.5 h-1.5 rounded-full ${accent.bar}`} />
            New announcement
          </span>
          {expanded && (
            <span className={`text-[10px] font-mono tabular-nums ${text.length > MAX_CHARS ? "text-rose-500" : "text-muted-foreground/50"}`}>
              {text.length}/{MAX_CHARS}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Avatar name={`${user?.firstName || ""} ${user?.lastName || ""}`} />
          <div className="flex-1 min-w-0">
            {/* Formatting toolbar — sits flush on top of the textarea like a single control */}
            {expanded && (
              <div className="flex items-center gap-0.5 rounded-t-xl border border-b-0 border-border bg-muted/40 px-1.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {TOOLBAR.map(({ icon: Icon, title, action }, i) => (
                  <button
                    key={i}
                    type="button"
                    title={title}
                    onMouseDown={(e) => e.preventDefault()} // keep textarea selection intact when clicking
                    onClick={action}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-150"
                  >
                    <Icon size={14} />
                  </button>
                ))}
                <div className="w-px h-4 bg-border mx-1" />
                <span className="text-[10px] text-muted-foreground/50">Markdown supported</span>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Share an announcement with everyone…"
              rows={3}
              style={{ minHeight: "88px", maxHeight: "240px" }}
              className={`w-full resize-none overflow-y-auto text-[15px] leading-7 border bg-muted/30 px-4 py-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 ${accent.ring} focus:bg-card transition-all duration-200 ${
                expanded ? "rounded-b-xl rounded-t-none" : "rounded-2xl"
              } ${focused ? "border-transparent" : "border-border"}`}
            />
          </div>
        </div>

        {/* Category switcher — underline tabs, not pills */}
        {!filingEvent && expanded && (
          <div className="mt-3 ml-12 flex items-center gap-4 border-b border-border/70 animate-in fade-in slide-in-from-top-1 duration-150">
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              const a = CATEGORY_ACCENT[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`relative text-[12px] font-semibold pb-2 -mb-px border-b-2 transition-colors duration-150 ${
                    isActive ? a.tab : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Event panel — live calendar tile mirrors what the feed will show */}
        {filingEvent && (
          <div className={`mt-3 ml-12 rounded-xl border border-violet-200 ${accent.wash} p-3 animate-in fade-in slide-in-from-top-1 duration-150`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-700">
                <CalendarPlus size={12} /> Event details
              </span>
              <button type="button" onClick={resetEvent} className="text-violet-500 hover:text-violet-700 transition p-0.5 rounded hover:bg-violet-100">
                <X size={13} />
              </button>
            </div>

            <div className="flex gap-3">
              {/* Live date tile — same shape/gradient as the PostCard event badge */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white flex flex-col items-center justify-center flex-shrink-0 leading-none shadow-sm">
                {datePreview ? (
                  <>
                    <span className="text-[9px] font-medium uppercase">{datePreview.month}</span>
                    <span className="text-base font-bold">{datePreview.day}</span>
                  </>
                ) : (
                  <CalendarDays size={16} className="opacity-80" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Event title (e.g. Fire Drill)"
                  className="w-full text-xs rounded-lg border border-violet-200 bg-card px-3 py-2 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="flex-1 min-w-[130px] text-xs rounded-lg border border-violet-200 bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                  <div className="flex-1 min-w-[110px] relative">
                    <Clock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full text-xs rounded-lg border border-violet-200 bg-card pl-7 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                    />
                  </div>
                </div>
                <div className="relative">
                  <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="w-full text-xs rounded-lg border border-violet-200 bg-card pl-7 pr-3 py-2 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attachments filmstrip */}
        {files.length > 0 && (
          <div className="mt-3 ml-12 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative group animate-in fade-in zoom-in-95 duration-150">
                {f.previewUrl ? (
                  <img src={f.previewUrl} alt={f.file.name} className="w-16 h-16 object-cover rounded-lg border border-border shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5" />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-border bg-muted/40 flex flex-col items-center justify-center gap-1 px-1 shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5">
                    <FileText size={16} className="text-blue-500" />
                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">{f.file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3.5 ml-12 pt-3 border-t border-border/60">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => imgInputRef.current?.click()}
              title="Add photos"
              className="p-2 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <ImageIcon size={17} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add files"
              className="p-2 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <Paperclip size={17} />
            </button>
            <input ref={imgInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <button
              type="button"
              onClick={() => {
                if (filingEvent) resetEvent();
                else { setFilingEvent(true); setFocused(true); }
              }}
              title="File an event"
              className={`p-2 rounded-lg hover:scale-110 active:scale-95 transition-all duration-150 ${
                filingEvent ? "text-violet-600 bg-violet-50" : "text-muted-foreground hover:text-violet-600 hover:bg-violet-50"
              }`}
            >
              <CalendarPlus size={17} />
            </button>
          </div>

          <Button
            onClick={handlePost}
            disabled={!canPost}
            size="sm"
            className={`rounded-full px-4 text-white transition-colors duration-200 disabled:opacity-40 ${accent.btn}`}
          >
            <span className="flex items-center gap-1.5">
              {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {posting ? "Posting…" : "Post"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}