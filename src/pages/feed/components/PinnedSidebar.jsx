import { Pin } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { Avatar } from "./Avatar";

/* A compact rail of pinned announcements. Clicking an entry scrolls the
   corresponding card into view in the main feed (pinned posts are always
   sorted to the top there, so this mostly acts as a quick-jump index). */
export function PinnedSidebar({ posts, onSelect }) {
  const pinned = posts.filter((p) => p.pinned);

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-5 bg-card border border-border rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Pin size={14} className="text-primary fill-primary" />
          <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
        </div>

        {pinned.length === 0 ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            No pinned announcements yet. Admins can pin important posts to keep them here.
          </p>
        ) : (
          <div className="space-y-1">
            {pinned.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect?.(p.id)}
                className="w-full text-left rounded-xl px-2.5 py-2 hover:bg-muted/50 transition group"
              >
                <p className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition">
                  {p.content || "(attachment)"}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Avatar name={p.from?.name} size="sm" />
                  <span className="text-[10px] text-muted-foreground truncate">{p.from?.name} · {p.date}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
