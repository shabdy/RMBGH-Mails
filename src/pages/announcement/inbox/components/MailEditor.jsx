import { useState } from "react";
import { EditorContent } from "@tiptap/react";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent } from "../../../../components/ui/dialog";
import {
  Bold, Italic, Underline, List, ListOrdered, Link2,
  AlignLeft, AlignCenter, AlignRight, Quote, Code,
  Undo, Redo, Trash2, Maximize2, Minimize2,
} from "lucide-react";

const btn =
  "h-9 w-9 flex items-center justify-center rounded-md transition-all duration-150 hover:bg-muted active:scale-95 text-foreground";
const activeBtn =
  "bg-muted border border-border shadow-sm scale-[0.98]";
const prevent = (e) => e.preventDefault();

function LinkModal({ open, onClose, onConfirm }) {
  const [url, setUrl] = useState("");
  const handleSubmit = () => {
    if (url.trim()) { onConfirm(url.trim()); setUrl(""); onClose(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setUrl(""); onClose(); } }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Insert Link</h3>
          <div className="space-y-1.5">
            <Label>URL</Label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!url.trim()}>Insert</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Toolbar({ editor, onExpand, expanded, onLink }) {
  if (!editor) return null;
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b shrink-0">
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto min-w-0">

        <div className="flex items-center gap-1 pr-2 border-r border-border shrink-0">
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${btn} ${editor.isActive("bold") ? activeBtn : ""}`}><Bold className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${btn} ${editor.isActive("italic") ? activeBtn : ""}`}><Italic className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${btn} ${editor.isActive("underline") ? activeBtn : ""}`}><Underline className="h-4 w-4" /></button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border shrink-0">
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${btn} text-xs font-bold ${editor.isActive("heading", { level: 1 }) ? activeBtn : ""}`}>H1</button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${btn} text-xs font-bold ${editor.isActive("heading", { level: 2 }) ? activeBtn : ""}`}>H2</button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border shrink-0">
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btn} ${editor.isActive("bulletList") ? activeBtn : ""}`}><List className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${btn} ${editor.isActive("orderedList") ? activeBtn : ""}`}><ListOrdered className="h-4 w-4" /></button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border shrink-0">
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`${btn} ${editor.isActive({ textAlign: "left" }) ? activeBtn : ""}`}><AlignLeft className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`${btn} ${editor.isActive({ textAlign: "center" }) ? activeBtn : ""}`}><AlignCenter className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`${btn} ${editor.isActive({ textAlign: "right" }) ? activeBtn : ""}`}><AlignRight className="h-4 w-4" /></button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border shrink-0">
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${btn} ${editor.isActive("blockquote") ? activeBtn : ""}`}><Quote className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${btn} ${editor.isActive("codeBlock") ? activeBtn : ""}`}><Code className="h-4 w-4" /></button>
        </div>

        <div className="flex items-center gap-1 px-2 shrink-0">
          <button type="button" onMouseDown={prevent} onClick={onLink} className={btn}><Link2 className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().undo().run()} className={btn}><Undo className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().redo().run()} className={btn}><Redo className="h-4 w-4" /></button>
          <button type="button" onMouseDown={prevent}
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className={`${btn} text-red-500 hover:bg-red-500/10`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="w-px h-5 bg-border mx-1 shrink-0" />
      <button
        type="button"
        onMouseDown={prevent}
        onClick={onExpand}
        title={expanded ? "Collapse" : "Expand editor"}
        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
      >
        {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

const editorClasses = `
  overflow-y-auto p-4 text-sm leading-7
  [&_.ProseMirror]:outline-none
  [&_.ProseMirror]:min-h-full
  [&_.ProseMirror_p]:mb-3
  [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3
  [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-2
  [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3
  [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3
  [&_.ProseMirror_li]:mb-1
  [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:mb-3
  [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:text-xs [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:mb-3
  [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline
  [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_u]:underline
  [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Type_your_message_here...']
  [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
  [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
  [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
  [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
`;

export function MailEditor({ editor, error }) {
  const [expanded, setExpanded] = useState(false);
  const [showLink, setShowLink] = useState(false);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <Label className="mb-2 block shrink-0">Message</Label>

      {!expanded && (
        <div
          className={`flex-1 min-h-0 max-h-full flex flex-col border rounded-xl bg-card shadow-sm cursor-text ${error ? "border-red-400" : ""}`}
          onClick={() => editor?.commands.focus()}
        >
          <Toolbar editor={editor} onExpand={() => setExpanded(true)} expanded={false} onLink={() => setShowLink(true)} />
          <div className="flex-1 min-h-0 overflow-y-auto">
            <EditorContent editor={editor} className={editorClasses} />
          </div>
        </div>
      )}

      {error && !expanded && <p className="text-xs text-red-500 mt-1 shrink-0">{error}</p>}

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="!grid-rows-none !grid-cols-none !flex !flex-col !gap-0 !max-w-4xl !w-[90vw] !h-[85vh] !p-0 rounded-2xl overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b bg-card">
            <span className="text-sm font-medium text-foreground">Message</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-2 py-1 rounded-md hover:bg-muted"
            >
              <Minimize2 className="h-3.5 w-3.5" /> Collapse
            </button>
          </div>
          {expanded && (
            <>
              <Toolbar editor={editor} onExpand={() => setExpanded(false)} expanded={true} onLink={() => setShowLink(true)} />
              <EditorContent editor={editor} className={`flex-1 min-h-0 ${editorClasses}`} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <LinkModal
        open={showLink}
        onClose={() => setShowLink(false)}
        onConfirm={(url) => editor?.chain().focus().setLink({ href: url }).run()}
      />
    </div>
  );
}
