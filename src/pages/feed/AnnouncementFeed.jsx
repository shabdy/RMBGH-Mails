import { Megaphone } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { PostComposer } from "./components/PostComposer";
import { PostCard } from "./components/PostCard";

export default function AnnouncementFeed() {
  const { posts } = usePosts();

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4 overflow-y-auto h-full">
      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Megaphone size={19} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Announcement</h1>
          <p className="text-sm text-muted-foreground">Post updates for everyone in the organization to see</p>
        </div>
      </div>

      <PostComposer />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <Megaphone size={40} className="text-muted-foreground/20" />
          <p className="text-sm font-medium">No announcements yet</p>
          <p className="text-xs">Be the first to post something.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
