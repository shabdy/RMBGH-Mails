import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { CreateMail } from "../inbox/components/CreateMail";
import { AnnouncementList } from "../inbox/AnnouncementList";
import { AnnouncementDetail } from "../inbox/AnnouncementDetail";
import { useAnnouncements } from "../../../context/AnnouncementContext";

export default function Inbox() {
  const { inbox, pinnedIds, togglePin, deleteFromInbox, markRead, currentUser } = useAnnouncements();
  const location = useLocation();
  const navigate  = useNavigate();

  const [search, setSearch]                 = useState("");
  const [tab, setTab]                       = useState("all");
  const [selected, setSelected]             = useState(null);
  const [openCreateMail, setOpenCreateMail] = useState(false);
  const [pendingMailId, setPendingMailId]   = useState(null);

  /* Handle navigation state: openCompose or jump-to-mail from notification */
  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.openCompose) setOpenCreateMail(true);
    if (state.mailId)      setPendingMailId(String(state.mailId));
    // Clear state so browser back doesn't retrigger
    navigate("/inbox", { replace: true, state: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  /* Once inbox is ready, auto-select the pending mail */
  useEffect(() => {
    if (!pendingMailId || inbox.length === 0) return;
    const mail = inbox.find(m => String(m.id) === pendingMailId);
    if (mail) {
      handleSelect(mail);
      setPendingMailId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMailId, inbox]);

  const handleSelect = (item) => {
    setSelected(item);
    if (item.unread) markRead(item.id);
  };

  const handleDelete = () => {
    deleteFromInbox(selected.id);
    setSelected(null);
  };

  const liveSelected = selected ? inbox.find(m => m.id === selected.id) ?? selected : null;

  const filtered = useMemo(() => {
    let data = inbox;

    if (tab === "allEmp") {
      // Mails sent to everyone (broadcast)
      data = data.filter(a => a.recipientType === "all");
    }
    if (tab === "myDept") {
      // Mails sent specifically to my department
      data = data.filter(a =>
        a.recipientType === "department" &&
        a.targetDepartmentId === currentUser?.departmentId
      );
    }
    if (tab === "pinned") {
      data = data.filter(a => pinnedIds.includes(a.id));
    }

    return data.filter(a => (a.title || "").toLowerCase().includes(search.toLowerCase()));
  }, [inbox, tab, search, pinnedIds, currentUser]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-6 py-4 flex items-center justify-between bg-background border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Announcements</h1>
          <p className="text-xs text-muted-foreground">
            {currentUser?.department} · {currentUser?.name}
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setOpenCreateMail(true)}>
          <Plus size={16} /> New
        </Button>
      </div>

      <div className="flex flex-1 min-h-0">
        <AnnouncementList
          tab={tab} setTab={setTab}
          search={search} setSearch={setSearch}
          items={filtered}
          pinnedIds={pinnedIds}
          selected={liveSelected}
          onSelect={handleSelect}
          onBulkDelete={(ids) => ids.forEach(id => deleteFromInbox(id))}
        />
        <AnnouncementDetail
          selected={liveSelected}
          isPinned={pinnedIds.includes(liveSelected?.id)}
          onTogglePin={() => togglePin(liveSelected?.id)}
          onDelete={handleDelete}
          currentUser={currentUser}
        />
      </div>

      <CreateMail open={openCreateMail} setOpen={setOpenCreateMail} />
    </div>
  );
}
