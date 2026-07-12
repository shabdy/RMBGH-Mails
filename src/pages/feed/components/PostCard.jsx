import { useState, useRef, useEffect, useContext } from "react";
import { MessageCircle, Forward, Trash2, Eye } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { usePosts } from "@/context/PostsContext";
import { Avatar } from "./Avatar";
import { ViewersDialog } from "./ViewersDialog";
import { ShareToMailModal } from "./ShareToMailModal";
import { DeleteModal } from "@/pages/announcement/inbox/components/DeleteModal";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow",  emoji: "😮", label: "Wow" },
  { type: "sad",  emoji: "😢", label: "Sad" },
];

export function PostCard({ post }) {
  const { user } = useContext(AuthContext);
  const { markViewed, react, addComment, deletePost } = usePosts();
  const ref = useRef(null);
  const [showViewers, setShowViewers] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const canDelete = isAdmin || String(post.from?.id) === String(user?.id);

  useEffect(() => {
    if (post.viewed) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { markViewed(post.id); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [post.id, post.viewed, markViewed]);

  const totalReactions = post.reactionCount || 0;
  const topEmojis = Object.entries(post.reactionCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTIONS.find((r) => r.type === type)?.emoji)
    .filter(Boolean);
  const myReactionInfo = REACTIONS.find((r) => r.type === post.myReaction);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <div ref={ref} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 px-4 pt-4">
        <Avatar name={post.from?.name} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{post.from?.name || "Unknown"}</p>
          <p className="text-[11px] text-muted-foreground">
            {post.from?.department ? `${post.from.department} · ` : ""}{post.date} at {post.time}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-muted-foreground/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="px-4 pt-3 pb-2">
        <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-t border-border/60">
        <button onClick={() => setShowViewers(true)} className="flex items-center gap-1 hover:text-foreground transition">
          <Eye size={12} /> Seen by {post.viewCount || 0}
        </button>
        {totalReactions > 0 && (
          <span className="flex items-center gap-1">
            <span>{topEmojis.join(" ")}</span> {totalReactions}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 border-t border-border">
        <div className="relative" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
          <button
            onClick={() => react(post.id, post.myReaction || "like")}
            className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition ${
              post.myReaction ? "text-blue-600" : "text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <span>{myReactionInfo?.emoji || "👍"}</span> {myReactionInfo?.label || "Like"}
          </button>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-lg z-10">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => { react(post.id, r.type); setShowReactions(false); }}
                  className="text-lg hover:scale-125 transition-transform"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition border-l border-border"
        >
          <MessageCircle size={13} /> Comment{post.commentCount > 0 ? ` (${post.commentCount})` : ""}
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition border-l border-border"
        >
          <Forward size={13} /> Share via Mail
        </button>
      </div>

      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/20">
          {(post.comments || []).map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar name={c.name} size="sm" />
              <div className="flex-1 min-w-0 bg-card border border-border rounded-lg px-3 py-2">
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
              className="flex-1 text-xs rounded-full border border-border bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-xs font-semibold text-primary disabled:text-muted-foreground/40 px-2"
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
