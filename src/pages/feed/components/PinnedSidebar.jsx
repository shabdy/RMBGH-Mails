import { useState } from "react";
import { Pin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "./Avatar";

const BAR_COLORS = ["bg-violet-400", "bg-sky-400", "bg-rose-400", "bg-amber-400", "bg-emerald-400"];

function PinnedRow({ p, i, onSelect }) {
  return (
    <button
      onClick={() => onSelect?.(p.id)}
      className="w-full text-left rounded-xl px-2.5 py-2 hover:bg-muted/50 hover:translate-x-0.5 transition-all duration-150 group flex items-start gap-2"
    >
      <span className={`w-1 self-stretch rounded-full flex-shrink-0 mt-0.5 ${BAR_COLORS[i % BAR_COLORS.length]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {p.content || "(attachment)"}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Avatar name={p.from?.name} size="sm" />
          <span className="text-[10px] text-muted-foreground truncate">{p.from?.name} · {p.date}</span>
        </div>
      </div>
    </button>
  );
}

/* A compact rail of pinned announcements. Clicking an entry scrolls the
   corresponding card into view in the main feed (pinned posts are always
   sorted to the top there, so this mostly acts as a quick-jump index).
   Only the first 3 show here; the rest live behind "View all". */
export function PinnedSidebar({ posts, onSelect }) {
  const pinned = posts.filter((p) => p.pinned);
  const [viewAll, setViewAll] = useState(false);

  const handleSelect = (id) => {
    setViewAll(false);
    onSelect?.(id);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Pin size={12} className="text-white fill-white" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
        </div>

        {pinned.length === 0 ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            No pinned announcements yet. Admins can pin important posts to keep them here.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              {pinned.slice(0, 4).map((p, i) => (
                <PinnedRow key={p.id} p={p} i={i} onSelect={onSelect} />
              ))}
            </div>
            {pinned.length > 4 && (
              <button
                onClick={() => setViewAll(true)}
                className="w-full text-center text-[11px] font-medium text-primary hover:underline mt-1.5 py-1"
              >
                View all · {pinned.length}
              </button>
            )}
          </>
        )}
      </div>

      <Dialog open={viewAll} onOpenChange={setViewAll}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin size={15} className="text-amber-500 fill-amber-500" /> Pinned · {pinned.length}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {pinned.map((p, i) => (
              <PinnedRow key={p.id} p={p} i={i} onSelect={handleSelect} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}