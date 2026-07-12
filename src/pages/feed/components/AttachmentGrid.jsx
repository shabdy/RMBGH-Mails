import { FileText, FileSpreadsheet, File as FileIcon, Download } from "lucide-react";

const isImage = (a) => (a.type || "").startsWith("image/");

function fileIcon(type) {
  if (type?.includes("pdf") || type?.includes("word")) return FileText;
  if (type?.includes("sheet") || type?.includes("excel")) return FileSpreadsheet;
  return FileIcon;
}

function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* Facebook-style grid: 1 image full-bleed, 2 side-by-side, 3 = big + 2 stacked,
   4+ = 2x2 with a "+N" overlay on the last cell. Non-image files render as
   download chips below the image grid. */
export function AttachmentGrid({ attachments = [] }) {
  if (!attachments.length) return null;
  const images = attachments.filter(isImage);
  const files  = attachments.filter((a) => !isImage(a));

  return (
    <div className="px-4 pb-3 space-y-2">
      {images.length > 0 && (
        <div
          className={`grid gap-1 rounded-xl overflow-hidden ${
            images.length === 1 ? "grid-cols-1" :
            images.length === 3 ? "grid-cols-2 grid-rows-2" :
            "grid-cols-2"
          }`}
        >
          {images.slice(0, 4).map((img, i) => {
            const extra = images.length > 4 && i === 3 ? images.length - 4 : 0;
            return (
              <a
                key={img.url}
                href={img.url}
                target="_blank"
                rel="noreferrer"
                className={`relative block bg-muted overflow-hidden group ${
                  images.length === 3 && i === 0 ? "row-span-2" : ""
                }`}
              >
                <img
                  src={img.url}
                  alt={img.name || "attachment"}
                  className="w-full h-full object-cover aspect-square group-hover:brightness-95 transition"
                  loading="lazy"
                />
                {extra > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                    +{extra}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f) => {
            const Icon = fileIcon(f.type);
            return (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                download={f.name}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/60 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtSize(f.size)}</p>
                </div>
                <Download size={13} className="text-muted-foreground/50 group-hover:text-foreground transition flex-shrink-0" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
