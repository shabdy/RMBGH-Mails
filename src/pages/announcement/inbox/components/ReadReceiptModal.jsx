import { Eye, CheckCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";

export function ReadReceiptsModal({ open, onClose, readBy }) {
  const list = readBy || [];
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye size={16} className="text-muted-foreground" />
            Seen by
            {list.length > 0 && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">({list.length})</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Eye size={20} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm">No one has viewed this yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {list.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {(r.name || "?").split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {r.dept} · {r.date} at {r.time}
                    </p>
                  </div>
                  <CheckCheck size={15} className="text-blue-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
