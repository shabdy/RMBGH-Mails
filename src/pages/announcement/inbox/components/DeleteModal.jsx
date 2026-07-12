import { Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";

export function DeleteModal({ open, onClose, onConfirm, title }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <div className="flex flex-col items-center text-center px-8 py-10 gap-4">

          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="h-7 w-7 text-red-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">Delete Announcement?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">"{title}"</span>?
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => { onConfirm(); onClose(); }}
            >
              Delete
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
