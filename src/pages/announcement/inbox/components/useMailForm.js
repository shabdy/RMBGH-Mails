import { useState, useRef } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";

export const REFERENCE_COUNTERS = {
  memorandum: 100, "office-order": 26, communication: 45,
  advisory: 12, notice: 8, circular: 63,
};

export const REFERENCE_PREFIXES = {
  memorandum: "MEMO", "office-order": "OO", communication: "COM",
  advisory: "ADV", notice: "NOT", circular: "CIR",
};

export function useMailForm() {
  const [enableEmailType, setEnableEmailType]         = useState(false);
  const [enableReferenceNo, setEnableReferenceNo]     = useState(false);
  const [emailType, setEmailType]                     = useState("");
  const [message, setMessage]                         = useState("");
  const [attachments, setAttachments]                 = useState([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [recipients, setRecipients]                   = useState([]);
  const [subject, setSubject]                         = useState("");

  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, codeBlock: false }),
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Blockquote, CodeBlock,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setMessage(editor.getHTML());
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const handlePreviewFile = (file) => {
    const fileUrl = URL.createObjectURL(file);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>${file.name}</title><style>body{margin:0;background:#111}iframe{width:100vw;height:100vh;border:none}</style></head><body><iframe src="${fileUrl}"></iframe></body></html>`);
    win.document.close();
    setTimeout(() => URL.revokeObjectURL(fileUrl), 15000);
  };

  const referenceNumber =
    emailType && REFERENCE_COUNTERS[emailType] !== undefined
      ? `${emailType.replace("-", " ").toUpperCase()}-${new Date().getFullYear()}-${String(
          (REFERENCE_COUNTERS[emailType] || 0) + 1
        ).padStart(4, "0")}`
      : "";

  const resetForm = () => {
    setEnableEmailType(false);
    setEnableReferenceNo(false);
    setEmailType("");
    setMessage("");
    setAttachments([]);
    setRecipients([]);
    setSubject("");
    editor?.commands.clearContent();
  };

  const loadDraft = (draft) => {
    if (!draft) return;
    setSubject(draft.subject || draft.title || "");
    setMessage(draft.content || "");
    editor?.commands.setContent(draft.content || "");
    setRecipients(draft.recipients || []);
    if (draft.emailType) {
      setEnableEmailType(true);
      setEmailType(draft.emailType);
    } else {
      setEnableEmailType(false);
      setEmailType("");
    }
    setAttachments(draft.attachment ? [draft.attachment] : []);
  };

  return {
    enableEmailType, setEnableEmailType,
    enableReferenceNo, setEnableReferenceNo,
    emailType, setEmailType,
    message, setMessage,
    attachments, setAttachments,
    showAttachmentModal, setShowAttachmentModal,
    recipients, setRecipients,
    subject, setSubject,
    fileInputRef,
    editor,
    handleFileChange,
    removeAttachment,
    handlePreviewFile,
    referenceNumber,
    resetForm,
    loadDraft,
  };
}