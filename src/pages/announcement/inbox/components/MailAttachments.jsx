import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Paperclip } from "lucide-react";
import { getFileIcon } from "./AttachmentModal";

export function MailAttachments({
  attachments,
  fileInputRef,
  onFileChange,
  onPreview,
  onRemove,
  onShowMore,
}) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex items-start gap-6">

        {/* ATTACH BUTTON */}
        <div className="flex flex-col gap-2">
          <Label className="font-medium">Attachment</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </Button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={onFileChange}
          />
        </div>

        {/* FILE LIST */}
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-3">
            PDF, DOC, DOCX, PNG, JPG (Max 10MB)
          </p>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-full">

              {attachments.slice(0, 4).map((file, index) => (
                <div
                  key={index}
                  onClick={() => onPreview(file)}
                  className="flex items-center gap-2 h-10 max-w-[220px] px-3 rounded-xl border bg-white hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition-all shadow-sm overflow-hidden"
                >
                  {getFileIcon(file)}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-medium truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    className="ml-1 text-slate-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}

              {attachments.length > 4 && (
                <button
                  type="button"
                  onClick={onShowMore}
                  className="h-10 px-4 flex items-center gap-1 rounded-xl border bg-slate-50 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  See More
                  <span className="text-slate-400">(+{attachments.length - 4})</span>
                </button>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}