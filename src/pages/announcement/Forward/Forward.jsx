import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ForwardList } from "./components/ForwardList";
import { ForwardDetail } from "./components/ForwardDetail";
import { useAnnouncements } from "../../../context/AnnouncementContext";
import { CreateMail } from "../../../pages/announcement/inbox/components/CreateMail";

export default function Forward() {
  const { forwarded, markReadForwarded, deleteFromForwarded } = useAnnouncements();
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  const handleSelect = (item) => {
    setSelected(item);
    markReadForwarded(item.id);
  };

  const handleDelete = () => {
    deleteFromForwarded(selected.id);
    setSelected(null);
  };

  const filtered = useMemo(() =>
    forwarded.filter(m => (m.title || "").toLowerCase().includes(search.toLowerCase())),
    [forwarded, search]
  );

  const liveSelected = selected ? forwarded.find(m => m.id === selected.id) ?? selected : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-6 py-4 flex items-center justify-between bg-white border-b">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Forwarded</h1>
          <p className="text-xs text-slate-500">Announcements you've forwarded</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setOpenCreate(true)}>
          <Plus size={16} /> New
        </Button>
      </div>
      <div className="flex flex-1 min-h-0">
        <ForwardList search={search} setSearch={setSearch} items={filtered} selected={liveSelected} onSelect={handleSelect}
          onBulkDelete={(ids) => { ids.forEach(id => deleteFromForwarded(id)); }} />
        <ForwardDetail selected={liveSelected} onDelete={handleDelete} />
      </div>
      <CreateMail open={openCreate} setOpen={setOpenCreate} />
    </div>
  );
}
