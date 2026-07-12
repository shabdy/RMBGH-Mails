import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "./Avatar";

export function ViewersDialog({ open, onClose, viewers }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye size={16} className="text-muted-foreground" /> Seen by ({viewers.length})
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-3 py-1">
          {viewers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No one has seen this yet.</p>
          ) : (
            viewers.map((v) => (
              <div key={v.id} className="flex items-center gap-2.5 px-1">
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
