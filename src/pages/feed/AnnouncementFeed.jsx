import { useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Megaphone } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { PostComposer } from "./components/PostComposer";
import { PostCard } from "./components/PostCard";
import { PinnedSidebar } from "./components/PinnedSidebar";
import { MediaFilesLinksSidebar } from "./components/MediaFilesLinksSidebar";
import { MiniCalendar } from "./components/MiniCalendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TABS = ["All", "Updates", "Events", "Policies", "Alerts"];
const SORTS = [
  { key: "newest",    label: "Newest first" },
  { key: "viewed",    label: "Most viewed" },
  { key: "discussed", label: "Most commented" },
];

export default function AnnouncementFeed() {
  const { posts } = usePosts();
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
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

  return (
    /* Outer wrapper — does NOT scroll; children manage their own overflow */
    <div className="px-4 pt-5 h-full overflow-hidden flex flex-col">
      <div className="flex items-start gap-4 w-full flex-1 min-h-0">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 flex flex-col h-full">

          {/* ── Sticky header: search + title + composer + tabs ── */}
          <div className="flex-shrink-0 space-y-3.5 pb-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search announcements, people, departments…"
                className="w-full text-sm rounded-xl border border-border bg-card pl-10 pr-16 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 bg-muted/60 rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Megaphone size={19} className="text-primary" /> Announcements
              </h1>
              <p className="text-sm text-muted-foreground">Stay updated with the latest news and important updates.</p>
            </div>

            {/* Post composer — always visible */}
            <PostComposer />

            {/* Category tabs + sort */}
            <div className="flex items-center justify-between bg-card border border-border rounded-xl shadow-sm px-2 py-1.5">
              <div className="flex items-center gap-1 overflow-x-auto">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                      tab === t
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition flex-shrink-0">
                    <SlidersHorizontal size={12} /> Filter
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {SORTS.map((s) => (
                    <DropdownMenuItem key={s.key} onClick={() => setSort(s.key)} className={sort === s.key ? "bg-accent" : ""}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Scrollable posts list ── */}
          <div className="flex-1 overflow-y-auto pb-5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground bg-card border border-border rounded-2xl">
                <Megaphone size={40} className="text-muted-foreground/20" />
                <p className="text-sm font-medium">
                  {posts.length === 0 ? "No announcements yet" : "No announcements match your search"}
                </p>
                <p className="text-xs">
                  {posts.length === 0 ? "Be the first to post something." : "Try a different tab or keyword."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((p) => (
                  <PostCard key={p.id} post={p} cardRef={(el) => { cardRefs.current[p.id] = el; }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar — scrolls independently ── */}
        <aside className="hidden lg:flex lg:flex-col gap-4 w-80 flex-shrink-0 overflow-y-auto h-full pb-5">
          <PinnedSidebar posts={posts} onSelect={scrollToPost} />
          <MediaFilesLinksSidebar posts={posts} />
          <MiniCalendar />
        </aside>
      </div>
    </div>
  );
}
