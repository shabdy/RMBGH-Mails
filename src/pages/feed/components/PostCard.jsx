import { useState, useRef, useEffect, useContext } from "react";
import { MessageCircle, Forward, Trash2, Eye, Pin, MoreVertical } from "lucide-react";
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
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow",  emoji: "😮", label: "Wow" },
  { type: "sad",  emoji: "😢", label: "Sad" },
];

const CATEGORY_STYLES = {
  Updates:  "bg-blue-50 text-blue-600",
  Events:   "bg-violet-50 text-violet-600",
  Policies: "bg-green-50 text-green-600",
  Alerts:   "bg-amber-50 text-amber-700",
};

export function PostCard({ post, cardRef }) {
  const { user } = useContext(AuthContext);
  const { markViewed, react, addComment, deletePost, togglePin } = usePosts();
  const viewRef = useRef(null);
  const [showViewers, setShowViewers] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const canDelete = isAdmin || String(post.from?.id) === String(user?.id);

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

  return (
    <div
      ref={(el) => { viewRef.current = el; if (cardRef) cardRef(el); }}
      className={`bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
        post.pinned ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
      } ${post._pending ? "opacity-70" : "opacity-100"}`}
    >
      {post.pinned && (
        <div className="flex items-center gap-1.5 px-4 pt-3.5">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 gap-1 font-semibold text-[10px] px-2 py-0.5">
            <Pin size={10} className="fill-primary" /> PINNED
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
                <button onClick={() => setShowViewers(true)} className="inline-flex items-center gap-0.5 hover:text-foreground transition">
                  <Eye size={11} /> {post.viewCount || 0} views
                </button>
              </>
            )}
          </p>
        </div>

        {!post._pending && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {isAdmin && (
              <button
                onClick={() => togglePin(post.id)}
                title={post.pinned ? "Unpin" : "Pin to sidebar"}
                className={`p-1.5 rounded-lg transition ${
                  post.pinned ? "text-primary hover:bg-primary/10" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Pin size={14} className={post.pinned ? "fill-primary" : ""} />
              </button>
            )}
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition">
                    <MoreVertical size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={13} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {post.content && (
        <div className="px-4 pt-2 pb-2">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
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
              className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 border transition disabled:opacity-50 ${
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
        <div className="relative" onMouseEnter={() => setShowReactionPicker(true)} onMouseLeave={() => setShowReactionPicker(false)}>
          <button
            onClick={() => handleReact(post.myReaction || "like")}
            disabled={post._pending}
            className={`flex items-center gap-1.5 font-medium hover:text-foreground transition disabled:opacity-50 ${
              post.myReaction ? "text-primary" : ""
            }`}
          >
            <span>{REACTIONS.find((r) => r.type === post.myReaction)?.emoji || "👍"}</span>
            {post.myReaction ? REACTIONS.find((r) => r.type === post.myReaction)?.label : "Like"}
          </button>
          {showReactionPicker && !post._pending && (
            <div className="absolute bottom-full left-0 mb-1.5 flex gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-lg z-10 animate-in fade-in zoom-in-95 duration-150">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => handleReact(r.type)}
                  className="text-lg hover:scale-125 hover:-translate-y-0.5 transition-transform"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowComments((v) => !v)}
            disabled={post._pending}
            className="flex items-center gap-1.5 font-medium hover:text-foreground transition disabled:opacity-50"
          >
            <MessageCircle size={13} /> {post.commentCount > 0 ? `${post.commentCount} Comments` : "Comment"}
          </button>
          <button
            onClick={() => setShowShare(true)}
            disabled={post._pending}
            className="flex items-center gap-1.5 font-medium hover:text-foreground transition disabled:opacity-50"
          >
            <Forward size={13} /> Share
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/20">
          {(post.comments || []).map((c) => (
            <div key={c.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <Avatar name={c.name} size="sm" />
              <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2">
                <p className="text-xs font-semibold text-foreground">{c.name}</p>
                <p className="text-xs text-foreground/90 mt-0.5">{c.text}</p>
              </div>
            </div>
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
