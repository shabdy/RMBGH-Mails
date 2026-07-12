import { useState, useEffect, useRef } from "react";
import { Loader2, Send, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../../../components/ui/dialog";
import { useAnnouncements } from "../../../../context/AnnouncementContext";
import { useMailForm } from "./useMailForm";
import { MailHeader } from "./MailHeader";
import { MailSettings } from "./MailSettings";
import { MailEditor } from "./MailEditor";
import { MailAttachments } from "./MailAttachments";
import { AttachmentModal } from "./AttachmentModal";
import { MailSuccessModal } from "./MailSuccessModal";

export const CreateMail = ({ open, setOpen, draft }) => {
  const { sendMail, saveDraft, deleteDraft, currentUser } = useAnnouncements();
  const [sendStatus,      setSendStatus]      = useState("idle");
  const [draftSaved,      setDraftSaved]      = useState(false);
  const [errors,          setErrors]          = useState({});
  const [recipientMode,   setRecipientMode]   = useState("specific");
  const [requiresReceipt, setRequiresReceipt] = useState(false);
  // Guard: prevents onOpenChange from firing handleAccidentalClose when
  // we're already closing the dialog programmatically via handleClose.
  const closingRef = useRef(false);

  const {
    enableEmailType, setEnableEmailType,
    enableReferenceNo, setEnableReferenceNo,
    emailType, setEmailType,
    message, setMessage,
    attachments,
    showAttachmentModal, setShowAttachmentModal,
    fileInputRef, editor,
    handleFileChange, removeAttachment, handlePreviewFile,
    referenceNumber,
    recipients, setRecipients,
    subject, setSubject,
    resetForm, loadDraft,
  } = useMailForm();

  /* Sync mode when opening a draft */
  useEffect(() => {
    if (open && draft) {
      loadDraft(draft);
      if (draft.recipientType === "department") setRecipientMode("department");
      else if (draft.recipientType === "all")   setRecipientMode("all");
      else                                       setRecipientMode("specific");
    } else if (open && !draft) {
      resetForm();
      setRecipientMode("specific");
      setRequiresReceipt(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft]);

  /* Validation */
  const validate = () => {
    const e = {};
    if (!subject.trim())
      e.subject = "Subject is required";
    if (recipientMode === "specific" && recipients.length === 0)
      e.to = "Please add at least one recipient";
    if (!message || message === "<p></p>")
      e.message = "Message cannot be empty";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Build common mail payload */
  const buildPayload = () => ({
    title:              subject || "(No subject)",
    content:            message,
    recipients:         recipientMode === "specific" ? recipients : [],
    recipientType:      recipientMode,
    targetDepartmentId: recipientMode === "department" ? (currentUser?.departmentId ?? null) : null,
    emailType:          enableEmailType && emailType ? emailType : "",
    emailTypeLabel:     enableEmailType && emailType
      ? emailType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
      : "",
    referenceNumber:    enableEmailType && enableReferenceNo && referenceNumber ? referenceNumber : "",
    attachment:         attachments[0] || null,
    requiresReceipt:    requiresReceipt,
  });

  const handleSend = async () => {
    if (!validate()) return;
    setSendStatus("sending");
    await sendMail(buildPayload());
    if (draft) deleteDraft(draft.id);
    setSendStatus("sent");
  };

  const handleSaveDraft = async () => {
    await saveDraft({ id: draft?.id, subject, ...buildPayload() });
    setDraftSaved(true);
    setTimeout(() => { setDraftSaved(false); handleClose(); }, 900);
  };

  /* Hard close */
  const handleClose = () => {
    closingRef.current = true;
    setSendStatus("idle");
    setErrors({});
    setRecipientMode("specific");
    setRequiresReceipt(false);
    resetForm();
    setOpen(false);
    setTimeout(() => { closingRef.current = false; }, 0);
  };

  /* Accidental close (Escape / click-outside) — auto-save draft */
  const handleAccidentalClose = async () => {
    if (closingRef.current) return;
    const hasContent = subject.trim() || (message && message !== "<p></p>");
    if (sendStatus !== "sent" && !draftSaved && hasContent) {
      await saveDraft({ id: draft?.id, subject, ...buildPayload() });
      toast.success("Draft saved automatically", { description: "Find it in your Drafts folder." });
    }
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleAccidentalClose(); }}>
        <DialogContent className="!grid-rows-none !grid-cols-none !flex !flex-col !gap-0 !w-[85vw] !max-w-[1200px] !h-[90vh] !p-0 rounded-2xl overflow-hidden">
          <div className="flex flex-col h-full min-h-0 bg-card">

            {/* ── TITLE BAR ── */}
            <DialogHeader className="shrink-0 px-6 py-3.5 border-b">
              <DialogTitle className="text-base font-semibold">
                {draft ? "Edit Draft" : "Create Mail"}
              </DialogTitle>
            </DialogHeader>

            {/* ── FIELDS: From / To / Subject / Settings ── */}
            <div className="shrink-0 border-b">
              <div className="px-6 pt-4 pb-3 space-y-3">
                <MailHeader
                  recipients={recipients}
                  setRecipients={setRecipients}
                  subject={subject}
                  setSubject={setSubject}
                  errors={errors}
                  setErrors={setErrors}
                  recipientMode={recipientMode}
                  setRecipientMode={setRecipientMode}
                />
              </div>
              {/* Settings row — sits just above the editor, separated by a subtle divider */}
              <div className="px-6 py-2.5 border-t bg-muted/20">
                <MailSettings
                  enableEmailType={enableEmailType}   setEnableEmailType={setEnableEmailType}
                  enableReferenceNo={enableReferenceNo} setEnableReferenceNo={setEnableReferenceNo}
                  emailType={emailType}               setEmailType={setEmailType}
                  referenceNumber={referenceNumber}
                  requiresReceipt={requiresReceipt}   setRequiresReceipt={setRequiresReceipt}
                />
              </div>
            </div>

            {/* ── MESSAGE — dominant, fills remaining space ── */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <MailEditor editor={editor} error={errors.message} />
            </div>

            {/* ── FOOTER: attachments + action buttons ── */}
            <div className="shrink-0 border-t px-6 py-3 flex items-center justify-between gap-4 bg-card">
              <MailAttachments
                attachments={attachments}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onPreview={handlePreviewFile}
                onRemove={removeAttachment}
                onShowMore={() => setShowAttachmentModal(true)}
              />

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={sendStatus === "sending"}
                  className="min-w-[120px]"
                >
                  {draftSaved
                    ? <span className="flex items-center gap-1.5 text-green-600"><FileCheck2 className="h-4 w-4" /> Saved!</span>
                    : "Save as Draft"}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sendStatus === "sending"}
                  className="min-w-[110px]"
                >
                  {sendStatus === "sending"
                    ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending…</span>
                    : <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Send Mail</span>}
                </Button>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {showAttachmentModal && (
        <AttachmentModal
          attachments={attachments}
          onClose={() => setShowAttachmentModal(false)}
          onPreview={handlePreviewFile}
          onRemove={removeAttachment}
        />
      )}

      <MailSuccessModal open={sendStatus === "sent"} onClose={handleClose} />
    </>
  );
};
