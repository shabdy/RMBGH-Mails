import { useState, useContext, useRef } from "react";
import { Send, Image as ImageIcon, Paperclip, X, FileText, Loader2, CalendarPlus, MapPin, Clock } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { usePosts } from "@/context/PostsContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";

const MAX_FILES = 6;
const MAX_SIZE = 15 * 1024 * 1024;
const CATEGORIES = ["Updates", "Events", "Policies", "Alerts"];

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
    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 transition-shadow focus-within:shadow-md">
      <div className="flex gap-3">
        <Avatar name={`${user?.firstName || ""} ${user?.lastName || ""}`} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Share an announcement with everyone…"
          rows={focused || text ? 3 : 1}
          className="flex-1 resize-none text-sm rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:bg-card transition-all"
        />
      </div>

      {!filingEvent && (focused || text || files.length > 0) && (
        <div className="mt-3 ml-12 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filingEvent && (
        <div className="mt-3 ml-12 rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700">
              <CalendarPlus size={13} /> Event details
            </span>
            <button type="button" onClick={resetEvent} className="text-violet-500 hover:text-violet-700 transition">
              <X size={13} />
            </button>
          </div>
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
      )}

      {files.length > 0 && (
        <div className="mt-3 ml-12 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative group">
              {f.previewUrl ? (
                <img src={f.previewUrl} alt={f.file.name} className="w-16 h-16 object-cover rounded-lg border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-border bg-muted/40 flex flex-col items-center justify-center gap-1 px-1">
                  <FileText size={16} className="text-muted-foreground" />
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

      <div className="flex items-center justify-between mt-3 ml-12">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => imgInputRef.current?.click()}
            title="Add photos"
            className="p-2 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 transition"
          >
            <ImageIcon size={17} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add files"
            className="p-2 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition"
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
            className={`p-2 rounded-lg transition ${
              filingEvent ? "text-violet-600 bg-violet-50" : "text-muted-foreground hover:text-violet-600 hover:bg-violet-50"
            }`}
          >
            <CalendarPlus size={17} />
          </button>
        </div>
        <Button onClick={handlePost} disabled={!canPost} size="sm" className="rounded-full px-4">
          <span className="flex items-center gap-1.5">
            {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {posting ? "Posting…" : "Post"}
          </span>
        </Button>
      </div>
    </div>
  );
}
