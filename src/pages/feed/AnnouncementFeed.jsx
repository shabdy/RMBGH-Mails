import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Megaphone,
  Plus,
} from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { PostComposer } from "./components/PostComposer";
import { PostCard } from "./components/PostCard";
import { PinnedSidebar } from "./components/PinnedSidebar";
import { MiniCalendar } from "./components/MiniCalendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TABS = ["All", "Updates", "Events", "Policies", "Alerts"];
const SORTS = [
  { key: "newest",    label: "Newest first" },
  { key: "viewed",    label: "Most viewed" },
  { key: "discussed", label: "Most commented" },
];

// Shared color accent per category — reused across tabs, badges, and cards
const TAB_ACCENT = {
  All:      "text-foreground bg-foreground/5",
  Updates:  "text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300",
  Events:   "text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300",
  Policies: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300",
  Alerts:   "text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function AnnouncementFeed() {
  const { posts } = usePosts();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [openComposer, setOpenComposer] = useState(false);
  const cardRefs = useRef({});

  const filtered = useMemo(() => {
    let list = [...posts];
    if (tab !== "All") list = list.filter((p) => (p.category || "Updates") === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) =>
        p.content?.toLowerCase().includes(q) ||
        p.from?.name?.toLowerCase().includes(q) ||
        p.from?.department?.toLowerCase().includes(q)
      );
    }
    if (sort === "viewed")    list.sort((a, b) => (b.viewCount    || 0) - (a.viewCount    || 0));
    else if (sort === "discussed") list.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return list;
  }, [posts, tab, query, sort]);

  const scrollToPost = (id) => {
    setTab("All");
    setQuery("");
    requestAnimationFrame(() => {
      cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  // Arriving from a notification click (Bell → "View" → here) carries the
  // target post id via router state — jump to it once posts are loaded.
  useEffect(() => {
    const targetId = location.state?.postId;
    if (!targetId || posts.length === 0) return;
    scrollToPost(targetId);
    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.postId, posts.length]);

  return (
    /* Outer wrapper scrolls the whole page — this is what puts the
       scrollbar at the true right edge of the viewport instead of nested
       inside an inner column. */
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-5 pb-5">
        <div className="flex items-start gap-4 w-full">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">

            {/* ── Sticky header: search + title + composer + tabs ── */}
            <div className="sticky top-0 z-10 bg-background space-y-3.5 pb-3">
              {/* Search */}
<div className="flex items-center gap-3">
  <div className="relative group flex-1">
    <Search
      size={16}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
    />

    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search announcements, people, departments…"
      className="w-full text-sm rounded-xl border border-border bg-card pl-10 pr-16 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
    />

    <kbd className="hidden sm:flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 bg-muted/60 rounded px-1.5 py-0.5">
      ⌘K
    </kbd>
  </div>

  <button
    onClick={() => setOpenComposer(true)}
    className="h-11 px-4 rounded-xl bg-black text-white hover:bg-neutral-800 transition flex items-center gap-2 font-medium shadow-sm"
  >
    <Plus size={16} />
    Create Announcement
  </button>
</div>

              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <Megaphone size={19} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Announcements</h1>
                  <p className="text-sm text-muted-foreground">Stay updated with the latest news and important updates.</p>
                </div>
              </div>

              {/* Category tabs + sort */}
              <div className="flex items-center justify-between bg-card border border-border rounded-xl shadow-sm px-2 py-1.5">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
                        tab === t
                          ? `${TAB_ACCENT[t]} scale-[1.03] shadow-sm`
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 border border-border rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0">
                      <SlidersHorizontal size={12} /> Filter
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {SORTS.map((s) => (
                      <DropdownMenuItem key={s.key} onClick={() => setSort(s.key)} className={sort === s.key ? "bg-accent text-primary font-medium" : ""}>
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* ── Posts list — scrolls with the page, not its own inner box ── */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground bg-card border border-border rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center mb-1">
                  <Megaphone size={28} className="text-primary/40" />
                </div>
                <p className="text-sm font-medium">
                  {posts.length === 0 ? "No announcements yet" : "No announcements match your search"}
                </p>
                <p className="text-xs">
                  {posts.length === 0 ? "Be the first to post something." : "Try a different tab or keyword."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDuration: "300ms", animationDelay: `${Math.min(i * 40, 320)}ms`, animationFillMode: "both" }}
                  >
                    <PostCard post={p} cardRef={(el) => { cardRefs.current[p.id] = el; }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar — stays put while the announcements scroll past it ── */}
          <aside className="hidden lg:flex lg:flex-col gap-4 w-80 flex-shrink-0 sticky top-5">
            <PinnedSidebar posts={posts} onSelect={scrollToPost} />
            <MiniCalendar />
          </aside>
        </div>
      </div>
      <Dialog open={openComposer} onOpenChange={setOpenComposer}>
  <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
    <DialogHeader className="px-6 pt-6 pb-2">
      <DialogTitle>Create Announcement</DialogTitle>
    </DialogHeader>

    <div className="px-6 pb-6">
      <PostComposer />
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}