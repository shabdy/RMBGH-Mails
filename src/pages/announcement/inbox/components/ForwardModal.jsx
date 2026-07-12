import { useState, useRef } from "react";
import { Forward, Send, Loader2, Paperclip, FileText, FileImage, File, X, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { useAnnouncements } from "../../../../context/AnnouncementContext";
import { RecipientPicker } from "../../inbox/components/RecipientPicker";

function getFileIcon(file) {
  if (file.type?.includes("image")) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (file.type?.includes("pdf"))   return <FileText  className="h-4 w-4 text-red-500" />;
  if (file.name?.match(/\.(doc|docx)$/)) return <FileText className="h-4 w-4 text-blue-600" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

const tbtn = "h-7 w-7 flex items-center justify-center rounded transition hover:bg-muted active:scale-95 text-foreground";
const active = "bg-muted";
const prevent = (e) => e.preventDefault();

function NoteEditor({ editor }) {
  if (!editor) return null;
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/50 border-b flex-wrap">
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBold().run()} className={`${tbtn} ${editor.isActive("bold") ? active : ""}`}><Bold size={13} /></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleItalic().run()} className={`${tbtn} ${editor.isActive("italic") ? active : ""}`}><Italic size={13} /></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${tbtn} ${editor.isActive("underline") ? active : ""}`}><Underline size={13} /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${tbtn} ${editor.isActive("bulletList") ? active : ""}`}><List size={13} /></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${tbtn} ${editor.isActive("orderedList") ? active : ""}`}><ListOrdered size={13} /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`${tbtn} ${editor.isActive({ textAlign: "left" }) ? active : ""}`}><AlignLeft size={13} /></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`${tbtn} ${editor.isActive({ textAlign: "center" }) ? active : ""}`}><AlignCenter size={13} /></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`${tbtn} ${editor.isActive({ textAlign: "right" }) ? active : ""}`}><AlignRight size={13} /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().undo().run()} className={tbtn}><Undo size={13} /></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().redo().run()} className={tbtn}><Redo size={13} /></button>
      </div>
      <EditorContent
        editor={editor}
        className="
          h-[130px] overflow-y-auto p-3 text-sm leading-6
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]
          [&_.ProseMirror_p]:mb-2
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4
          [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_u]:underline
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Add_a_note_to_include_with_this_forward...']
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
        "
      />
    </div>
  );
}

export function ForwardModal({ open, onClose, selected }) {
  const { forwardMail, currentUser } = useAnnouncements();

  const [recipients, setRecipients]         = useState([]);
  const [status, setStatus]                 = useState("idle");
  const [attachments, setAttachments]       = useState([]);
  const [recipientError, setRecipientError] = useState("");
  const fileInputRef = useRef(null);

  const noteEditor = useEditor({
    extensions: [
      StarterKit.configure({ blockquote: false, codeBlock: false, heading: false }),
      UnderlineExtension,
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: "",
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const handleForward = async () => {
    if (recipients.length === 0) {
      setRecipientError("Please select at least one recipient");
      return;
    }
    setRecipientError("");
    setStatus("sending");
    await new Promise((res) => setTimeout(res, 1500));

    const note = noteEditor?.getHTML() || "";
    const recipientLabel = recipients.length === 1
      ? recipients[0].name
      : `${recipients.length} recipients`;

    forwardMail({
      original: selected,
      forwardedTo: recipients,
      forwardedToLabel: recipientLabel,
      note,
      attachment: attachments[0] || selected?.attachment || null,
    });

    setStatus("sent");
  };

  const handleClose = () => {
    setRecipients([]);
    setRecipientError("");
    noteEditor?.commands.clearContent();
    setAttachments([]);
    setStatus("idle");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">

        {status === "sent" ? (
          <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Forward className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Forwarded!</h2>
              <p className="text-sm text-muted-foreground mt-1">The announcement has been successfully forwarded.</p>
            </div>
            <Button className="w-full mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Forward size={16} className="text-muted-foreground" /> Forward Announcement
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* ORIGINAL PREVIEW */}
              {selected && (
                <div className="px-3 py-3 bg-muted/50 border-l-2 border-border rounded-r-lg">
                  <p className="text-xs font-semibold text-foreground truncate">{selected.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{selected.sender} · {selected.date}</p>
                </div>
              )}

              {/* TO */}
              <div className="space-y-1.5">
                <Label>Forward To</Label>
                <RecipientPicker
                  recipients={recipients}
                  setRecipients={(val) => { setRecipients(val); setRecipientError(""); }}
                  currentUser={currentUser}
                />
                {recipientError && <p className="text-xs text-red-500">{recipientError}</p>}
              </div>

              {/* NOTE */}
              <div className="space-y-2">
                <Label>Add a note <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <NoteEditor editor={noteEditor} />
              </div>

              {/* ATTACHMENT */}
              <div className="space-y-2">
                <Label>Attachment <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg text-xs">
                    <Paperclip size={13} className="mr-1.5" /> Attach File
                  </Button>
                  <span className="text-[11px] text-muted-foreground">PDF, DOC, PNG, JPG (Max 10MB)</span>
                  <input type="file" multiple ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} />
                </div>

                {selected?.attachment && attachments.length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg bg-muted/50">
                    <FileText size={13} className="text-red-400 shrink-0" />
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {typeof selected.attachment === "string" ? selected.attachment : selected.attachment?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 shrink-0">Original</span>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card">
                        {getFileIcon(file)}
                        <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button type="button" onClick={() => removeAttachment(index)} className="text-muted-foreground/30 hover:text-red-400 transition">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-card">
              <Button variant="outline" onClick={handleClose} disabled={status === "sending"}>Cancel</Button>
              <Button onClick={handleForward} disabled={status === "sending"} className="min-w-[110px]">
                {status === "sending"
                  ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Forwarding...</span>
                  : <span className="flex items-center gap-2"><Send size={14} /> Forward</span>}
              </Button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
