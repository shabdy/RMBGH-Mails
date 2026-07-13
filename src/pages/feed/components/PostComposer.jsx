import { useState, useContext, useRef } from "react";
import { Send, Image as ImageIcon, Paperclip, X, FileText, Loader2 } from "lucide-react";
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
  const imgInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const canPost = (text.trim().length > 0 || files.length > 0) && !posting;

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
      await createPost(text, attachments, category);
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      setText("");
      setFiles([]);
      setCategory("Updates");
      setFocused(false);
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

      {(focused || text || files.length > 0) && (
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
