import { useRef, useState, useEffect } from "react";
import { PenLine, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { useAnnouncements } from "../../../../context/AnnouncementContext";
import { toast } from "sonner";

export function AcknowledgeModal({ open, onClose, selected, currentUser }) {
  const { acknowledgeMail } = useAnnouncements();

  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef(null);

  const [hasSignature, setHasSignature] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  /* Snapshot date/time at the moment the modal opens */
  const [snapDate, setSnapDate] = useState("");
  const [snapTime, setSnapTime] = useState("");

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setSnapDate(now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    setSnapTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    setHasSignature(false);

    /* Fill canvas with white bg once it mounts */
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 60);
    return () => clearTimeout(timer);
  }, [open]);

  /* ── drawing helpers ── */
  const getPos = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current   = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();

    lastPos.current = pos;
    if (!hasSignature) setHasSignature(true);
  };

  const stopDraw = () => {
    isDrawing.current = false;
    lastPos.current   = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!hasSignature || submitting) return;
    setSubmitting(true);
    const signature = canvasRef.current?.toDataURL("image/png");
    await acknowledgeMail(selected.id, signature);
    setSubmitting(false);
    toast.success("Receipt acknowledged", {
      description: "Your acknowledgment has been recorded.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col bg-background">

          {/* HEADER */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                <PenLine size={16} className="text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Acknowledge Receipt
                </DialogTitle>
                {selected?.title && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    Re: {selected.title}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/50 rounded-xl px-4 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
                  Received by
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {currentUser?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
                  Department
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {currentUser?.department || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
                  Date
                </p>
                <p className="text-sm text-foreground">{snapDate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
                  Time
                </p>
                <p className="text-sm text-foreground">{snapTime}</p>
              </div>
            </div>

            {/* Signature pad */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  Signature
                </p>
                {hasSignature && (
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
              </div>

              <div
                className={`border-2 rounded-xl overflow-hidden transition-colors ${
                  hasSignature
                    ? "border-blue-300 dark:border-blue-700"
                    : "border-dashed border-border"
                }`}
                style={{ height: 140 }}
              >
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={140}
                  className="w-full h-full cursor-crosshair touch-none bg-white"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>

              {!hasSignature && (
                <p className="text-[11px] text-muted-foreground text-center">
                  Draw your signature in the box above
                </p>
              )}
            </div>

          </div>

          {/* FOOTER */}
          <div className="px-6 pb-5 flex gap-3 justify-end border-t pt-4">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasSignature || submitting}
              className="gap-2"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Acknowledging…</>
              ) : (
                <><CheckCircle2 size={14} /> Acknowledge</>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
