import { useState, useEffect } from "react";
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

/*
  recipientMode: "specific" | "department" | "all"
    - "specific"   → named individual(s); only they can see it
    - "department" → sender's own department; only dept members can see it
    - "all"        → broadcast; every active employee can see it
*/

export const CreateMail = ({ open, setOpen, draft }) => {
  const { sendMail, saveDraft, deleteDraft, currentUser } = useAnnouncements();
  const [sendStatus,    setSendStatus]    = useState("idle");
  const [draftSaved,    setDraftSaved]    = useState(false);
  const [errors,        setErrors]        = useState({});
  const [recipientMode, setRecipientMode] = useState("specific");

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft]);

  /* Validation — recipients only required in "specific" mode */
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
    attachment: attachments[0] || null,
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

  /* Hard close — used after send or explicit draft save */
  const handleClose = () => {
    setSendStatus("idle");
    setErrors({});
    setRecipientMode("specific");
    resetForm();
    setOpen(false);
  };

  /* Accidental close (Escape / click-outside / X) — auto-save draft if content exists */
  const handleAccidentalClose = async () => {
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
        <DialogContent className="!grid-rows-none !grid-cols-none !flex !flex-col !gap-0 !w-[85vw] !max-w-[1400px] !h-[95vh] !p-0 rounded-2xl overflow-hidden">
          <div className="flex flex-col h-full min-h-0 bg-card">

            <DialogHeader className="shrink-0 px-6 py-4 border-b">
              <DialogTitle className="text-xl font-semibold">
                {draft ? "Edit Draft" : "Create Mail"}
              </DialogTitle>
            </DialogHeader>

            <div className="shrink-0 px-8 pt-5 pb-3 space-y-4 border-b">
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
              <MailSettings
                enableEmailType={enableEmailType} setEnableEmailType={setEnableEmailType}
                enableReferenceNo={enableReferenceNo} setEnableReferenceNo={setEnableReferenceNo}
                emailType={emailType} setEmailType={setEmailType}
                referenceNumber={referenceNumber}
              />
            </div>

            <div className="flex-1 min-h-0 flex flex-col px-8 py-4 gap-3 overflow-hidden">
              <MailEditor editor={editor} error={errors.message} />
              <div className="shrink-0">
                <MailAttachments
                  attachments={attachments} fileInputRef={fileInputRef}
                  onFileChange={handleFileChange} onPreview={handlePreviewFile}
                  onRemove={removeAttachment} onShowMore={() => setShowAttachmentModal(true)}
                />
              </div>
            </div>

            <div className="shrink-0 border-t px-8 py-4 flex items-center justify-end gap-3 bg-card">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={sendStatus === "sending"}
                className="min-w-[130px]"
              >
                {draftSaved
                  ? <span className="flex items-center gap-2 text-green-600"><FileCheck2 className="h-4 w-4" /> Saved!</span>
                  : "Save as Draft"}
              </Button>
              <Button onClick={handleSend} disabled={sendStatus === "sending"} className="min-w-[110px]">
                {sendStatus === "sending"
                  ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending...</span>
                  : <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Send Mail</span>}
              </Button>
            </div>

            {showAttachmentModal && (
              <AttachmentModal
                attachments={attachments}
                onClose={() => setShowAttachmentModal(false)}
                onPreview={handlePreviewFile}
                onRemove={removeAttachment}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MailSuccessModal open={sendStatus === "sent"} onClose={handleClose} />
    </>
  );
};
