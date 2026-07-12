import { useState, useContext } from "react";
import { Send } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { usePosts } from "@/context/PostsContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";

export function PostComposer() {
  const { user } = useContext(AuthContext);
  const { createPost } = usePosts();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    await createPost(text);
    setText("");
    setPosting(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4">
      <div className="flex gap-3">
        <Avatar name={`${user?.firstName || ""} ${user?.lastName || ""}`} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share an announcement with everyone…"
          rows={3}
          className="flex-1 resize-none text-sm rounded-lg border border-border bg-muted/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="flex justify-end mt-3">
        <Button onClick={handlePost} disabled={!text.trim() || posting} size="sm">
          <span className="flex items-center gap-1.5">
            <Send size={13} /> Post
          </span>
        </Button>
      </div>
    </div>
  );
}
