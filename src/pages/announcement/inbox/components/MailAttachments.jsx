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
    <div className="flex items-center gap-3 flex-1 min-w-0">

      {/* Attach button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0 h-8 gap-1.5 text-xs"
      >
        <Paperclip className="h-3.5 w-3.5" />
        Attach
      </Button>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={onFileChange}
      />

      {/* File chips / placeholder */}
      {attachments.length === 0 ? (
        <span className="text-xs text-muted-foreground truncate">
          PDF, DOC, DOCX, PNG, JPG · Max 10 MB
        </span>
      ) : (
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {attachments.slice(0, 3).map((file, index) => (
            <div
              key={index}
              onClick={() => onPreview(file)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border bg-muted/50 hover:bg-muted cursor-pointer transition-colors text-xs max-w-[180px]"
            >
              {getFileIcon(file)}
              <span className="truncate max-w-[110px]">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                className="ml-0.5 text-muted-foreground hover:text-red-500 shrink-0 leading-none"
              >
                ×
              </button>
            </div>
          ))}
          {attachments.length > 3 && (
            <button
              type="button"
              onClick={onShowMore}
              className="h-7 px-2.5 rounded-lg border bg-muted/50 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              +{attachments.length - 3} more
            </button>
          )}
        </div>
      )}

    </div>
  );
}
