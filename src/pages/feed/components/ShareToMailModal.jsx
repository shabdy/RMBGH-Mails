import { useState } from "react";
import { Forward, Send, Building2, Users, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RecipientPicker } from "@/pages/announcement/inbox/components/RecipientPicker";
import { useAnnouncements } from "@/context/AnnouncementContext";

const MODES = [
  { key: "specific",   label: "Specific",       icon: Users },
  { key: "department",  label: "My Department", icon: Building2 },
  { key: "all",          label: "All Employees", icon: Globe },
];

export function ShareToMailModal({ post, open, onClose }) {
  const { sendMail, currentUser } = useAnnouncements();
  const [mode, setMode] = useState("specific");
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const reset = () => { setMode("specific"); setRecipients([]); setError(""); setStatus("idle"); };
  const handleClose = () => { reset(); onClose(); };

  const handleShare = async () => {
    if (mode === "specific" && recipients.length === 0) {
      setError("Please select at least one recipient");
      return;
    }
    const excerpt = (post.content || "").slice(0, 60);
    const content =
      `<p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;font-weight:600">📢 Shared Announcement — from ${post.from?.name || "Unknown"}</p>` +
      `<p>${(post.content || "").replace(/\n/g, "<br/>")}</p>`;
    await sendMail({
      title: `Shared Announcement: ${excerpt}${(post.content || "").length > 60 ? "…" : ""}`,
      content,
      recipients: mode === "specific" ? recipients : [],
      recipientType: mode,
      targetDepartmentId: mode === "department" ? currentUser?.departmentId : null,
    });
    setStatus("sent");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        {status === "sent" ? (
          <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Forward className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Shared!</h2>
              <p className="text-sm text-muted-foreground mt-1">The announcement has been sent via mail.</p>
            </div>
            <Button className="w-full mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Forward size={16} className="text-muted-foreground" /> Share via Mail
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-5 space-y-4">
              <div className="px-3 py-3 bg-muted/50 border-l-2 border-border rounded-r-lg">
                <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>
              </div>
              <div className="space-y-2">
                <Label>Send to</Label>
                <div className="flex gap-1 p-1 rounded-xl bg-muted/60 border">
                  {MODES.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setMode(key); setRecipients([]); setError(""); }}
                      className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mode === key ? "bg-background shadow-sm text-foreground border border-border/60" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                </div>
                {mode === "specific" && (
                  <>
                    <RecipientPicker recipients={recipients} setRecipients={(v) => { setRecipients(v); setError(""); }} />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-card">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleShare}>
                <span className="flex items-center gap-2"><Send size={14} /> Share</span>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
