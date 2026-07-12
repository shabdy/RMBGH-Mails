import { useRef, useState, useEffect } from "react";
import { PenLine, RotateCcw, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { useAnnouncements } from "../../../../context/AnnouncementContext";
import { toast } from "sonner";

const TABS = [
  { id: "draw",   label: "Draw" },
  { id: "upload", label: "Upload PNG" },
];

export function AcknowledgeModal({ open, onClose, selected, currentUser }) {
  const { acknowledgeMail } = useAnnouncements();

  /* ── tabs ── */
  const [tab, setTab] = useState("draw");

  /* ── draw state ── */
  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  /* ── upload state ── */
  const fileInputRef        = useRef(null);
  const [uploadedSig, setUploadedSig] = useState(null); // base64 data URL
  const [dragOver,    setDragOver]    = useState(false);

  const [submitting, setSubmitting] = useState(false);

  /* Snapshot date/time at the moment the modal opens */
  const [snapDate, setSnapDate] = useState("");
  const [snapTime, setSnapTime] = useState("");

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setSnapDate(now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    setSnapTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    setHasDrawn(false);
    setUploadedSig(null);
    setTab("draw");

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
    if (!hasDrawn) setHasDrawn(true);
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
    setHasDrawn(false);
  };

  /* ── upload helpers ── */
  const loadFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setUploadedSig(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    loadFile(e.target.files[0]);
    e.target.value = "";            // allow re-selecting same file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  };

  /* ── derived ── */
  const hasSignature = tab === "draw" ? hasDrawn : !!uploadedSig;

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!hasSignature || submitting) return;
    setSubmitting(true);

    let signature;
    if (tab === "draw") {
      signature = canvasRef.current?.toDataURL("image/png");
    } else {
      signature = uploadedSig;
    }

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

            {/* Signature section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  Signature
                </p>

                {/* Tab switcher */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                        tab === t.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── DRAW TAB ── */}
              {tab === "draw" && (
                <>
                  <div
                    className={`border-2 rounded-xl overflow-hidden transition-colors ${
                      hasDrawn
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
                  <div className="flex items-center justify-between min-h-[18px]">
                    {!hasDrawn ? (
                      <p className="text-[11px] text-muted-foreground">
                        Draw your signature in the box above
                      </p>
                    ) : (
                      <span />
                    )}
                    {hasDrawn && (
                      <button
                        onClick={clearCanvas}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                      >
                        <RotateCcw size={11} /> Clear
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── UPLOAD TAB ── */}
              {tab === "upload" && (
                <>
                  {!uploadedSig ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-colors select-none
                        ${dragOver
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                          : "border-border hover:border-blue-300 hover:bg-muted/40"
                        }`}
                      style={{ height: 140 }}
                    >
                      <Upload size={22} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Click or drag &amp; drop to upload
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or any image file</p>
                    </div>
                  ) : (
                    <div className="relative border-2 border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden bg-white" style={{ height: 140 }}>
                      <img
                        src={uploadedSig}
                        alt="Uploaded signature"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => setUploadedSig(null)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center transition"
                        title="Remove"
                      >
                        <X size={12} className="text-foreground" />
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground min-h-[18px]">
                    {uploadedSig ? "Signature loaded — remove to replace." : "Upload a saved e-signature image."}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
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
