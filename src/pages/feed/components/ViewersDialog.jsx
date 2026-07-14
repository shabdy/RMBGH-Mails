import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "./Avatar";

export function ViewersDialog({ open, onClose, viewers }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Eye size={14} className="text-white" />
            </div>
            Seen by ({viewers.length})
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-3 py-1">
          {viewers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No one has seen this yet.</p>
          ) : (
            viewers.map((v, i) => (
              <div
                key={v.id}
                className="flex items-center gap-2.5 px-1 animate-in fade-in slide-in-from-bottom-1"
                style={{ animationDuration: "200ms", animationDelay: `${Math.min(i * 30, 200)}ms`, animationFillMode: "both" }}
              >
                <Avatar name={v.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">{v.date} at {v.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}