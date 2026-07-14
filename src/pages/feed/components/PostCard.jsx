import { useState, useRef, useEffect, useContext } from "react";
import { MessageCircle, Forward, Trash2, Eye, Pin, MoreVertical, CalendarDays, MapPin, Clock, CornerDownRight, Pencil, Check, X } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { usePosts } from "@/context/PostsContext";
import { Avatar } from "./Avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewersDialog } from "./ViewersDialog";
import { ShareToMailModal } from "./ShareToMailModal";
import { AttachmentGrid } from "./AttachmentGrid";
import { DeleteModal } from "@/pages/announcement/inbox/components/DeleteModal";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like", color: "text-blue-600" },
  { type: "love", emoji: "❤️", label: "Love", color: "text-rose-600" },
  { type: "haha", emoji: "😂", label: "Haha", color: "text-amber-600" },
  { type: "wow",  emoji: "😮", label: "Wow",  color: "text-violet-600" },
  { type: "sad",  emoji: "😢", label: "Sad",  color: "text-sky-600" },
];

const CATEGORY_STYLES = {
  Updates:  "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300",
  Events:   "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
  Policies: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  Alerts:   "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const CATEGORY_BAR = {
  Updates:  "bg-sky-400",
  Events:   "bg-violet-400",
  Policies: "bg-emerald-400",
  Alerts:   "bg-amber-400",
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// event.date is a plain "yyyy-mm-dd" string — parse the parts directly so
// display never shifts a day due to local-timezone Date parsing.
function parseEventDate(dateStr) {
  const [y, m, d] = (dateStr || "").split("-").map(Number);
  return { y, m: m - 1, d };
}
function eventMonthShort(dateStr) { const { m } = parseEventDate(dateStr); return MONTHS_SHORT[m] || ""; }
function eventDay(dateStr) { const { d } = parseEventDate(dateStr); return d || ""; }
function eventDateLabel(dateStr) {
  const { y, m, d } = parseEventDate(dateStr);
  return `${MONTHS_LONG[m] || ""} ${d}, ${y}`;
}
function eventTimeLabel(timeStr) {
  const [h, min] = (timeStr || "").split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(min || 0).padStart(2, "0")} ${period}`;
}

// ── Lightweight markdown rendering ─────────────────────────────────────
// Mirrors the syntax the composer's toolbar inserts: **bold**, *italic*,
// <u>underline</u>, ~~strike~~, [text](url), "- " bullets, "1. " numbered
// lists. Intentionally minimal — no external markdown dependency.
const INLINE_PATTERNS = [
  { regex: /\[([^\]]+)\]\(([^)\s]+)\)/, render: (m, key) => (
      <a key={key} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
        {parseInline(m[1], `${key}-c`)}
      </a>
    ) },
  { regex: /\*\*([^*]+)\*\*/, render: (m, key) => <strong key={key} className="font-semibold">{parseInline(m[1], `${key}-c`)}</strong> },
  { regex: /<u>([\s\S]+?)<\/u>/, render: (m, key) => <u key={key}>{parseInline(m[1], `${key}-c`)}</u> },
  { regex: /~~([^~]+)~~/, render: (m, key) => <s key={key} className="opacity-70">{parseInline(m[1], `${key}-c`)}</s> },
  { regex: /\*([^*]+)\*/, render: (m, key) => <em key={key}>{parseInline(m[1], `${key}-c`)}</em> },
];

function parseInline(str, keyPrefix = "n") {
  let earliest = null;
  for (const p of INLINE_PATTERNS) {
    const m = p.regex.exec(str);
    if (m && (earliest === null || m.index < earliest.m.index)) earliest = { p, m };
  }
  if (!earliest) return str ? [str] : [];
  const { p, m } = earliest;
  const before = str.slice(0, m.index);
  const after = str.slice(m.index + m[0].length);
  const key = `${keyPrefix}-${m.index}`;
  return [
    ...(before ? [before] : []),
    p.render(m, key),
    ...parseInline(after, `${key}n`),
  ];
}

function renderFormattedContent(content) {
  const lines = (content || "").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^-\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^-\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-1 space-y-0.5">
          {items.map((it, idx) => <li key={idx}>{parseInline(it, `ul-${i}-${idx}`)}</li>)}
        </ul>
      );
    } else if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 my-1 space-y-0.5">
          {items.map((it, idx) => <li key={idx}>{parseInline(it, `ol-${i}-${idx}`)}</li>)}
        </ol>
      );
    } else if (line.trim() === "") {
      blocks.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
    } else {
      blocks.push(<p key={`p-${i}`} className="mb-0">{parseInline(line, `p-${i}`)}</p>);
      i++;
    }
  }
  return blocks;
}
// ─────────────────────────────────────────────────────────────────────

/**
 * Small reusable reaction control for comments & replies.
 * Shows the current reaction (or a default outline "Like"), plus a hover
 * picker with the full reaction set, and a compact tally of counts.
 */
function CommentReactionControl({ myReaction, reactionCounts, onReact, disabled }) {
  const [showPicker, setShowPicker] = useState(false);
  const hideTimeout = useRef(null);

  const active = REACTIONS.find((r) => r.type === myReaction);
  const activeReactions = REACTIONS
    .map((r) => ({ ...r, count: reactionCounts?.[r.type] || 0 }))
    .filter((r) => r.count > 0);

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative"
        onMouseEnter={() => { clearTimeout(hideTimeout.current); setShowPicker(true); }}
        onMouseLeave={() => { hideTimeout.current = setTimeout(() => setShowPicker(false), 200); }}
      >
        <button
          onClick={() => onReact(myReaction || "like")}
          disabled={disabled}
          className={`text-[11px] font-semibold hover:text-foreground transition disabled:opacity-50 ${
            active ? active.color : "text-muted-foreground"
          }`}
        >
          {active ? `${active.emoji} ${active.label}` : "Like"}
        </button>

        {showPicker && !disabled && (
          <div className="absolute bottom-full left-0 pb-1.5 z-50">
            <div className="flex gap-0.5 bg-card border border-border rounded-full px-1.5 py-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => onReact(r.type)}
                  title={r.label}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-base cursor-pointer hover:bg-muted hover:scale-125 hover:-translate-y-1 transition-all duration-150"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeReactions.length > 0 && (
        <div className="flex items-center gap-1">
          {activeReactions.map((r) => (
            <span key={r.type} className="text-[10px] text-muted-foreground/80 flex items-center gap-0.5">
              {r.emoji}{r.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A single comment, with its own reaction control, a Reply toggle,
 * and a list of replies (each of which also gets reactions).
 */
function CommentItem({ comment, onReactComment, onReactReply, onAddReply, disabled }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = async () => {
    if (!replyText.trim() || disabled) return;
    await onAddReply(comment.id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-start gap-2">
        <Avatar name={comment.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-xs font-semibold text-foreground">{comment.name}</p>
            <p className="text-xs text-foreground/90 mt-0.5">{comment.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 pl-1">
            <CommentReactionControl
              myReaction={comment.myReaction}
              reactionCounts={comment.reactionCounts}
              onReact={(type) => onReactComment(comment.id, type)}
              disabled={disabled}
            />
            <button
              onClick={() => setShowReplyBox((v) => !v)}
              disabled={disabled}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {(comment.replies || []).length > 0 && (
        <div className="mt-2 pl-8 space-y-2 border-l border-border/60 ml-3">
          {comment.replies.map((r) => (
            <div key={r.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <Avatar name={r.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-foreground/90 mt-0.5">{r.text}</p>
                </div>
                <div className="mt-1 pl-1">
                  <CommentReactionControl
                    myReaction={r.myReaction}
                    reactionCounts={r.reactionCounts}
                    onReact={(type) => onReactReply(comment.id, r.id, type)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReplyBox && (
        <div className="mt-2 pl-8 ml-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <CornerDownRight size={12} className="text-muted-foreground/50 flex-shrink-0" />
          <input
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitReply(); }}
            placeholder={`Reply to ${comment.name}…`}
            className="flex-1 text-xs rounded-full border border-border bg-card px-3.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
          <button
            onClick={submitReply}
            disabled={!replyText.trim()}
            className="text-xs font-semibold text-primary disabled:text-muted-foreground/40 px-2 hover:scale-105 transition-transform"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, cardRef }) {
  const { user } = useContext(AuthContext);
  const {
    markViewed,
    react,
    addComment,
    deletePost,
    togglePin,
    reactToComment,
    addReply,
    reactToReply,
    editPost,
  } = usePosts();
  const viewRef = useRef(null);
  const [showViewers, setShowViewers] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const hideReactionTimeout = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expandedContent, setExpandedContent] = useState(false);
  const [contentOverflowing, setContentOverflowing] = useState(false);
  const contentRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const CONTENT_CLAMP_PX = 112; // ~4-5 lines at text-sm/leading-relaxed before "See more" kicks in — kept tight so long posts don't eat feed space

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const isOwnPost = String(post.from?.id) === String(user?.id);
  const canDelete = isAdmin || isOwnPost;
  const canEdit = isOwnPost; // editing is author-only, even for admins
  // Pin permission mirrors the backend's canPinPost rule:
  //  - superadmin: any post · admin: own post or same department · user: own post only
  const canPin =
    user?.role === "superadmin" ||
    isOwnPost ||
    (user?.role === "admin" && user?.departmentId && user.departmentId === post.from?.departmentId);
  const categoryBar = CATEGORY_BAR[post.category] || "bg-muted-foreground/20";

  const startEdit = () => {
    setEditText(post.content || "");
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editText.trim() && !(post.attachments || []).length && !post.event) return;
    setSavingEdit(true);
    try {
      await editPost(post.id, { content: editText.trim() });
      setIsEditing(false);
    } catch {
      // editPost already logs; keep the editor open so the user can retry
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    if (post.viewed) return;
    const el = viewRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { markViewed(post.id); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [post.id, post.viewed, markViewed]);

  // Measure the rendered content once (and whenever it changes) to decide
  // whether it's long enough to need a "See more" toggle at all.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setContentOverflowing(el.scrollHeight > CONTENT_CLAMP_PX + 4);
  }, [post.content]);

  const activeReactions = REACTIONS
    .map((r) => ({ ...r, count: post.reactionCounts?.[r.type] || 0 }))
    .filter((r) => r.count > 0);

  const handleComment = async () => {
    if (!commentText.trim() || post._pending) return;
    await addComment(post.id, commentText);
    setCommentText("");
  };

  const handleReact = (type) => {
    if (post._pending) return;
    react(post.id, type);
    setShowReactionPicker(false);
  };

  const handleReactComment = (commentId, type) => {
    if (post._pending) return;
    reactToComment?.(post.id, commentId, type);
  };

  const handleReactReply = (commentId, replyId, type) => {
    if (post._pending) return;
    reactToReply?.(post.id, commentId, replyId, type);
  };

  const handleAddReply = async (commentId, text) => {
    if (post._pending) return;
    await addReply?.(post.id, commentId, text);
  };

  return (
    <div
      ref={(el) => { viewRef.current = el; if (cardRef) cardRef(el); }}
      className={`relative bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        post.pinned ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
      } ${post._pending ? "opacity-70" : "opacity-100"}`}
    >
      {/* Category accent bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${categoryBar}`} />

      {post.pinned && (
        <div className="flex items-center gap-1.5 px-4 pt-3.5">
          <Badge className="bg-black text-white hover:bg-neutral-800 gap-1 font-semibold text-[10px] px-2 py-0.5 shadow-sm">
            <Pin size={10} className="fill-white" /> PINNED
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3 px-4 pt-3">
        <Avatar name={post.from?.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{post.from?.name || "Unknown"}</p>
            {post.from?.department && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLES[post.category] || "bg-muted text-muted-foreground"}`}>
                {post.from.department}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            {post._pending ? "Posting…" : (
              <>
                {post.date} at {post.time}
                <span className="mx-0.5">·</span>
                <button onClick={() => setShowViewers(true)} className="inline-flex items-center gap-0.5 hover:text-primary transition-colors">
                  <Eye size={11} /> {post.viewCount || 0} views
                </button>
              </>
            )}
          </p>
        </div>

        {!post._pending && !isEditing && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {canPin && (
              <button
                onClick={() => togglePin(post.id)}
                title={post.pinned ? "Unpin" : "Pin to sidebar"}
                className={`p-1.5 rounded-lg transition-all duration-150 hover:scale-110 ${
                  post.pinned ? "text-primary hover:bg-primary/10" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Pin size={14} className={post.pinned ? "fill-primary" : ""} />
              </button>
            )}
            {(canDelete || canEdit) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition">
                    <MoreVertical size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={startEdit}>
                      <Pencil size={13} /> Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                      <Trash2 size={13} /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="px-4 pt-2 pb-3">
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            className="w-full text-sm rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/25 focus:bg-card transition-all resize-none"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              disabled={savingEdit}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition disabled:opacity-50"
            >
              <X size={12} /> Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={savingEdit || !editText.trim()}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Check size={12} /> {savingEdit ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : post.content && (
        <div className="px-4 pt-2 pb-2">
          <div
            ref={contentRef}
            className="text-sm text-foreground leading-relaxed relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: expandedContent ? "999px" : `${CONTENT_CLAMP_PX}px` }}
          >
            {renderFormattedContent(post.content)}
            {!expandedContent && contentOverflowing && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
          </div>
          {contentOverflowing && (
            <button
              onClick={() => setExpandedContent((v) => !v)}
              className="mt-0.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition leading-none"
            >
              {expandedContent ? "See less" : "See more"}
            </button>
          )}
          {post.edited && (
            <span className="text-[10px] text-muted-foreground/60 italic">(edited)</span>
          )}
        </div>
      )}

      {post.event && (
        <div className="px-4 pb-3">
          <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50/50 p-3 flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white flex flex-col items-center justify-center flex-shrink-0 leading-none shadow-sm">
              <span className="text-[9px] font-medium uppercase">{eventMonthShort(post.event.date)}</span>
              <span className="text-base font-bold">{eventDay(post.event.date)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-violet-900">{post.event.title}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-violet-700/80 flex-wrap">
                <span className="flex items-center gap-1"><CalendarDays size={11} /> {eventDateLabel(post.event.date)}</span>
                {post.event.time && <span className="flex items-center gap-1"><Clock size={11} /> {eventTimeLabel(post.event.time)}</span>}
                {post.event.location && <span className="flex items-center gap-1"><MapPin size={11} /> {post.event.location}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <AttachmentGrid attachments={post.attachments} />

      {activeReactions.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 pt-1 pb-2 flex-wrap">
          {activeReactions.map((r) => (
            <button
              key={r.type}
              onClick={() => handleReact(r.type)}
              disabled={post._pending}
              className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 border transition disabled:opacity-50 hover:scale-105 ${
                post.myReaction === r.type
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <span>{r.emoji}</span> {r.count}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-t border-border/60">
        <div
          className="relative"
          onMouseEnter={() => {
            clearTimeout(hideReactionTimeout.current);
            setShowReactionPicker(true);
          }}
          onMouseLeave={() => {
            hideReactionTimeout.current = setTimeout(() => {
              setShowReactionPicker(false);
            }, 220);
          }}
        >
          <button
            onClick={() => handleReact(post.myReaction || "like")}
            disabled={post._pending}
            className={`flex items-center gap-1.5 font-medium hover:text-foreground transition disabled:opacity-50 ${
              post.myReaction
                ? REACTIONS.find((r) => r.type === post.myReaction)?.color
                : ""
            }`}
          >
            <span>
              {REACTIONS.find((r) => r.type === post.myReaction)?.emoji || "👍"}
            </span>
            {post.myReaction
              ? REACTIONS.find((r) => r.type === post.myReaction)?.label
              : "Like"}
          </button>

          {showReactionPicker && !post._pending && (
            <div className="absolute bottom-full left-0 pb-2 z-50">
              <div className="flex gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => handleReact(r.type)}
                    title={r.label}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-2xl cursor-pointer hover:bg-muted hover:scale-125 hover:-translate-y-1 transition-all duration-150"
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowComments((v) => !v)}
            disabled={post._pending}
            className="flex items-center gap-1.5 font-medium hover:text-blue-600 transition disabled:opacity-50"
          >
            <MessageCircle size={13} /> {post.commentCount > 0 ? `${post.commentCount} Comments` : "Comment"}
          </button>
          <button
            onClick={() => setShowShare(true)}
            disabled={post._pending}
            className="flex items-center gap-1.5 font-medium hover:text-emerald-600 transition disabled:opacity-50"
          >
            <Forward size={13} /> Share
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-150">
          {(post.comments || []).map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onReactComment={handleReactComment}
              onReactReply={handleReactReply}
              onAddReply={handleAddReply}
              disabled={post._pending}
            />
          ))}
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleComment(); }}
              placeholder="Write a comment…"
              className="flex-1 text-xs rounded-full border border-border bg-card px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-xs font-semibold text-primary disabled:text-muted-foreground/40 px-2 hover:scale-105 transition-transform"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <ViewersDialog open={showViewers} onClose={() => setShowViewers(false)} viewers={post.viewedBy || []} />
      <ShareToMailModal post={post} open={showShare} onClose={() => setShowShare(false)} />
      <DeleteModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deletePost(post.id)}
        title="this announcement"
      />
    </div>
  );
}