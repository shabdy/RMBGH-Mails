import { useMemo, useState } from "react";
import { FileEdit, Trash2, Search, Plus } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Checkbox as CheckboxUI } from "../../../components/ui/checkbox";
import { useAnnouncements } from "../../../context/AnnouncementContext";
import { CreateMail } from "../inbox/components/CreateMail";
import { DeleteModal } from "../inbox/components/DeleteModal";
import { RecipientsModal } from "../inbox/components/RecipientsModal";
import { DraftDetail } from "./components/DraftDetail";

export default function Drafts() {
  const { drafts, deleteDraft } = useAnnouncements();
  const [search, setSearch]                 = useState("");
  const [selected, setSelected]             = useState(null);
  const [editingDraft, setEditingDraft]     = useState(null);
  const [openCompose, setOpenCompose]       = useState(false);
  const [showDelete, setShowDelete]         = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [selectedIds, setSelectedIds]       = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const filtered = useMemo(() =>
    drafts.filter(d => (d.title || "").toLowerCase().includes(search.toLowerCase())),
    [drafts, search]
  );

  const handleEdit   = (draft) => { setEditingDraft(draft); setOpenCompose(true); };
  const handleDelete = () => { deleteDraft(selected.id); setSelected(null); };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (filtered.length > 0 && selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(d => d.id));
  };
  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteDraft(id));
    setSelectedIds([]);
    setShowBulkDelete(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* PAGE HEADER */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between bg-background border-b">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Drafts</h1>
          <p className="text-xs text-muted-foreground">Unsent announcements saved as drafts</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => { setEditingDraft(null); setOpenCompose(true); }}>
          <Plus size={16} /> New
        </Button>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* LIST PANEL */}
        <div className="w-[380px] border-r flex flex-col h-full overflow-hidden bg-background shrink-0">
          <div className="p-3 border-b shrink-0 space-y-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search drafts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>

            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CheckboxUI checked={filtered.length > 0 && selectedIds.length === filtered.length} onCheckedChange={toggleAll} />
                  <button onClick={toggleAll} className="text-xs text-muted-foreground hover:text-foreground">
                    {selectedIds.length === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
                    <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => setShowBulkDelete(true)}>
                      <Trash2 size={12} /> Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <FileEdit size={20} className="text-muted-foreground/30" />
                <span className="text-sm">No drafts saved</span>
              </div>
            ) : (
              filtered.map(d => {
                const preview = d.content
                  ? d.content.replace(/<[^>]*>/g, "").slice(0, 50) || "No content"
                  : "No content";
                const isChecked = selectedIds.includes(d.id);
                const recipientName = Array.isArray(d.recipients) && d.recipients.length > 0
                  ? d.recipients.length === 1
                    ? d.recipients[0]?.name
                    : `${d.recipients[0]?.name} +${d.recipients.length - 1}`
                  : d.recipientLabel || null;

                return (
                  <button key={d.id} onClick={() => setSelected(d)}
                    className={
                      "w-full text-left px-3 py-2.5 border-b hover:bg-muted/50 transition " +
                      (selected?.id === d.id ? "bg-accent border-l-2 border-l-primary" : "")
                    }
                  >
                    <div className="flex items-start gap-2.5">
                      <div onClick={e => toggleSelect(e, d.id)} className="mt-1 shrink-0">
                        <CheckboxUI checked={isChecked} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-500 shrink-0">DRAFT</span>
                            <p className="text-sm font-medium truncate text-foreground">{d.title}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">{d.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                        {recipientName && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">To: {recipientName}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <DraftDetail
          selected={selected}
          onEdit={handleEdit}
          onDelete={() => setShowDelete(true)}
          onShowRecipients={() => setShowRecipients(true)}
        />
      </div>

      <CreateMail
        open={openCompose}
        setOpen={v => { setOpenCompose(v); if (!v) { setEditingDraft(null); setSelected(null); } }}
        draft={editingDraft}
      />

      {selected && (
        <DeleteModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title={selected.title} />
      )}
      <DeleteModal
        open={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title={`${selectedIds.length} draft${selectedIds.length !== 1 ? "s" : ""}`}
      />
      <RecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={selected?.recipients} />
    </div>
  );
}
