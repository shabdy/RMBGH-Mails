import { useMemo, useState } from "react";
import { Image as ImageIcon, FileText, Link2, ExternalLink, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const URL_RE = /https?:\/\/[^\s<>"')]+/gi;
const isImage = (a) => (a.type || "").startsWith("image/");

/* Pulls every media file, non-image file, and shared link out of the whole
   feed so the sidebar can show a "recent activity" digest without a
   dedicated backend endpoint — everything it needs already rides along on
   each post's `content` and `attachments`. */
function useFeedAssets(posts) {
  return useMemo(() => {
    const media = [];
    const files = [];
    const links = [];

    for (const p of posts) {
      for (const a of p.attachments || []) {
        const entry = { ...a, postId: p.id, date: p.date, author: p.from?.name };
        if (isImage(a)) media.push(entry);
        else files.push(entry);
      }
      const found = p.content?.match(URL_RE);
      if (found) {
        for (const url of found) {
          let host = url;
          try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* keep raw */ }
          links.push({ url, host, postId: p.id, date: p.date, author: p.from?.name });
        }
      }
    }
    return { media, files, links };
  }, [posts]);
}

function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ext(name) {
  const parts = (name || "").split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

function MediaRow({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-muted/50 transition group"
    >
      <img src={item.url} alt={item.name} className="w-11 h-11 rounded-lg object-cover border border-border flex-shrink-0" loading="lazy" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition">{item.name || "Photo"}</p>
        <p className="text-[10px] text-muted-foreground">{item.date} · {ext(item.name)}</p>
      </div>
    </a>
  );
}

function FileRow({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      download={item.name}
      className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-muted/50 transition group"
    >
      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
        <FileText size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition">{item.name}</p>
        <p className="text-[10px] text-muted-foreground">{item.date} · {fmtSize(item.size)}</p>
      </div>
      <Download size={12} className="text-muted-foreground/50 group-hover:text-foreground transition flex-shrink-0" />
    </a>
  );
}

function LinkRow({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-muted/50 transition group"
    >
      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
        <Link2 size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition">{item.host}</p>
        <p className="text-[10px] text-muted-foreground truncate">{item.author} · {item.date}</p>
      </div>
      <ExternalLink size={12} className="text-muted-foreground/50 group-hover:text-foreground transition flex-shrink-0" />
    </a>
  );
}

const EMPTY = {
  media: "No shared photos yet.",
  files: "No shared files yet.",
  links: "No shared links yet.",
};

const ROW_COMPONENTS = { media: MediaRow, files: FileRow, links: LinkRow };

export function MediaFilesLinksSidebar({ posts }) {
  const { media, files, links } = useFeedAssets(posts);
  const [viewAll, setViewAll] = useState(null); // "media" | "files" | "links" | null

  const data = { media, files, links };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ImageIcon size={14} className="text-primary" /> Media, Files &amp; Links
          </h2>
        </div>

        <Tabs defaultValue="media">
          <TabsList className="w-full">
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="links" className="text-xs">Links</TabsTrigger>
          </TabsList>

          {["media", "files", "links"].map((key) => {
            const Row = ROW_COMPONENTS[key];
            return (
              <TabsContent key={key} value={key} className="mt-2">
                {data[key].length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">{EMPTY[key]}</p>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      {data[key].slice(0, 3).map((item, i) => (
                        <Row key={i} item={item} />
                      ))}
                    </div>
                    {data[key].length > 3 && (
                      <button
                        onClick={() => setViewAll(key)}
                        className="w-full text-center text-[11px] font-medium text-primary hover:underline mt-1.5 py-1"
                      >
                        View all {data[key].length}
                      </button>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <Dialog open={!!viewAll} onOpenChange={(open) => !open && setViewAll(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">{viewAll}</DialogTitle>
          </DialogHeader>
          <div className="space-y-0.5">
            {viewAll && data[viewAll].length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">{EMPTY[viewAll]}</p>
            )}
            {viewAll === "media" && data.media.map((item, i) => <MediaRow key={i} item={item} />)}
            {viewAll === "files" && data.files.map((item, i) => <FileRow key={i} item={item} />)}
            {viewAll === "links" && data.links.map((item, i) => <LinkRow key={i} item={item} />)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
