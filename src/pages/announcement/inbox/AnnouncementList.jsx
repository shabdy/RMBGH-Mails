import { useState, useEffect } from "react";
import { Building2, Globe, Pin, Trash2 } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import { useAnnouncements } from "../../../context/AnnouncementContext";
import { PaginationBar } from "../../../components/ui/pagination-bar";

const TABS = [
  { key: "all",    label: "All" },
  { key: "allEmp", label: "All Employees" },
  { key: "myDept", label: "My Department" },
  { key: "pinned", label: "Pinned", icon: true },
];

function ItemAvatar({ name }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

function SeenAvatars({ readBy }) {
  if (!readBy || readBy.length === 0) return null;
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex -space-x-1.5">
        {readBy.slice(0, 3).map((r, i) => (
          <div key={i} title={`${r.name} (${r.dept})`}
            className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[8px] font-semibold border border-white">
            {(r.name || "?").split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?"}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {readBy.length > 3 ? `+${readBy.length - 3} seen` : `${readBy.length} seen`}
      </span>
    </div>
  );
}

export function AnnouncementList({ tab, setTab, search, setSearch, items, pinnedIds, selected, onSelect, onBulkDelete }) {
  const { currentUser } = useAnnouncements();
  const [selectedIds, setSelectedIds] = useState([]);
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  // Reset to first page whenever the item list changes (tab / search filter applied in parent)
  useEffect(() => { setPage(1); }, [items]);
  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === items.length ? [] : items.map((i) => i.id));

  const handleBulkDelete = () => { onBulkDelete?.(selectedIds); setSelectedIds([]); };

  return (
    <div className="w-[380px] border-r flex flex-col h-full overflow-hidden bg-background shrink-0">

      {/* TABS */}
      <div className="flex text-xs border-b bg-background shrink-0">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={"flex items-center gap-1 px-3 py-3 transition whitespace-nowrap " +
              (tab === t.key ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-muted-foreground hover:text-foreground")}>
            {t.icon && <Pin size={10} className={tab === t.key ? "fill-blue-600 text-blue-600" : "fill-slate-400 text-muted-foreground"} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH + BULK */}
      <div className="p-3 border-b shrink-0 space-y-2">
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={items.length > 0 && selectedIds.length === items.length}
              onCheckedChange={toggleAll}
            />
            <button onClick={toggleAll} className="text-xs text-muted-foreground hover:text-foreground">
              {selectedIds.length === items.length && items.length > 0 ? "Deselect All" : "Select All"}
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
              <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={handleBulkDelete}>
                <Trash2 size={12} /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {items.length === 0 ? (
          tab === "pinned" ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Pin size={20} className="text-slate-200" />
              <span className="text-sm text-muted-foreground">No pinned messages</span>
            </div>
          ) : tab === "myDept" ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Building2 size={20} className="text-slate-200" />
              <span className="text-sm text-muted-foreground">No department messages</span>
            </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">No announcements found</div>
          )
        ) : (
          paginated.map((item) => {
            const isChecked = selectedIds.includes(item.id);

            /* ── Recipient label using new schema ── */
            const isDept  = item.recipientType === "department";
            const isAll   = item.recipientType === "all";

            const recipientLabel = isDept
              ? `All ${item.senderDept || "Department"} Employees`
              : isAll
                ? "All Employees"
                : Array.isArray(item.recipients) && item.recipients.length > 0
                  ? item.recipients.length === 1
                    ? item.recipients[0]?.name
                    : `${item.recipients[0]?.name} +${item.recipients.length - 1}`
                  : item.recipientLabel || "Recipients";

            const RecipientIcon = isDept ? Building2 : isAll ? Globe : null;

            return (
              <div key={item.id} role="button" tabIndex={0}
                onClick={() => onSelect(item)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
                className={"w-full text-left px-3 py-2.5 border-b hover:bg-muted/50 cursor-pointer transition " +
                  (selected?.id === item.id ? "bg-accent border-l-2 border-l-primary" : "")}>
                <div className="flex items-start gap-2.5">

                  {/* CHECKBOX */}
                  <div onClick={(e) => toggleSelect(e, item.id)} className="mt-1 shrink-0">
                    <Checkbox checked={isChecked} />
                  </div>

                  {/* AVATAR */}
                  <ItemAvatar name={item.sender} />

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {item.unread && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />}
                        <p className={"text-xs truncate " + (item.unread ? "font-semibold text-foreground" : "font-medium text-slate-600")}>
                          {item.sender}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                    </div>

                    <p className={"text-sm truncate mt-0.5 " + (item.unread ? "font-medium text-slate-800" : "text-slate-600")}>
                      {item.title}
                    </p>

                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {RecipientIcon && <RecipientIcon size={10} />}
                        <span className="truncate max-w-[160px]">{recipientLabel}</span>
                        {pinnedIds.includes(item.id) && <Pin size={10} className="text-amber-400 fill-amber-400 ml-1" />}
                      </div>
                      <SeenAvatars readBy={item.readBy} />
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      <PaginationBar
        page={page}
        totalPages={Math.ceil(items.length / PAGE_SIZE)}
        total={items.length}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        compact
      />
    </div>
  );
}
