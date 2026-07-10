import { CheckCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent } from "../../../../components/ui/dialog";

export function MailSuccessModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <div className="flex flex-col items-center text-center px-8 py-10 gap-4">

          {/* ICON */}
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>

          {/* TEXT */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Mail Sent!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Your announcement has been successfully sent to the recipients.
            </p>
          </div>

          {/* ACTION */}
          <Button className="w-full mt-2" onClick={onClose}>
            Done
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}