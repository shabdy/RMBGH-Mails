import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { SentList } from "./components/SentList";
import { SentDetail } from "./components/SentDetail";
import { useAnnouncements } from "../../../context/AnnouncementContext";
import { CreateMail } from "../../../pages/announcement/inbox/components/CreateMail";

export default function Sent() {
  const {
    sent,
    deleteFromSent,
    markReadSent,
    currentUser,
  } = useAnnouncements();
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

const handleSelect = (item) => {
  setSelected(item);
};

  const handleDelete = () => {
    deleteFromSent(selected.id);
    setSelected(null);
  };

  const filtered = useMemo(() =>
    sent.filter(m => m.title.toLowerCase().includes(search.toLowerCase())),
    [sent, search]
  );

  const liveSelected = selected ? sent.find(m => m.id === selected.id) ?? selected : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-6 py-4 flex items-center justify-between bg-background border-b">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sent</h1>
          <p className="text-xs text-muted-foreground">Your sent announcements</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setOpenCreate(true)}>
          <Plus size={16} /> New
        </Button>
      </div>
      <div className="flex flex-1 min-h-0">
        <SentList search={search} setSearch={setSearch} items={filtered} selected={liveSelected} onSelect={handleSelect}
          onBulkDelete={(ids) => { ids.forEach(id => deleteFromSent(id)); }} />
        <SentDetail
  selected={liveSelected}
  onDelete={handleDelete}
  currentUser={currentUser}
/>
      </div>
      <CreateMail open={openCreate} setOpen={setOpenCreate} />
    </div>
  );
}
