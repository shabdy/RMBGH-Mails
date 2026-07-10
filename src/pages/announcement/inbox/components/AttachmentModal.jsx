import { FileImage, FileText, File } from "lucide-react";

export function getFileIcon(file) {
  if (file.type?.includes("image")) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (file.type?.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />;
  if (file.name?.match(/\.(doc|docx)$/)) return <FileText className="h-4 w-4 text-blue-600" />;
  return <File className="h-4 w-4 text-slate-500" />;
}

export function AttachmentModal({ attachments, onClose, onPreview, onRemove }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card w-[500px] max-h-[80vh] rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">
            Attachments ({attachments.length})
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-red-500">
            ✕
          </button>
        </div>

        {/* LIST */}
        <div className="p-4 space-y-2 overflow-y-auto max-h-[65vh]">
          {attachments.map((file, index) => (
            <div
              key={index}
              onClick={() => onPreview(file)}
              className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(file)}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate max-w-[300px]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>

                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}