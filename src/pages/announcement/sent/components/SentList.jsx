import { useState, useEffect } from "react";
import {
  Globe,
  Building2,
  Trash2,
} from "lucide-react";

import { Input } from "../../../../components/ui/input";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Button } from "../../../../components/ui/button";

const STATUS_CONFIG = {
  delivered: {
    label: "Delivered",
    class: "bg-green-50 text-green-600",
  },
  pending: {
    label: "Pending",
    class: "bg-amber-50 text-amber-600",
  },
  failed: {
    label: "Failed",
    class: "bg-red-50 text-red-500",
  },
};

export function SentList({
  search,
  setSearch,
  items,
  selected,
  onSelect,
  onBulkDelete,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => items.some((m) => m.id === id))
    );
  }, [items]);

  const allSelected =
    items.length > 0 &&
    selectedIds.length === items.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="w-[380px] border-r flex flex-col h-full overflow-hidden bg-background shrink-0">

      {/* SEARCH + BULK ACTIONS */}
      <div className="p-3 border-b shrink-0 space-y-3">
        <Input
          placeholder="Search sent mails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {items.length > 0 && (
          <div className="flex items-center justify-between px-1">

            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
              />

              <button
                onClick={toggleAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {allSelected
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">

                <span className="text-xs text-muted-foreground">
                  {selectedIds.length} selected
                </span>

                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs gap-1"
                  onClick={handleBulkDelete}
                >
                  <Trash2 size={12} />
                  Delete
                </Button>

              </div>
            )}

          </div>
        )}
      </div>

      {/* LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No sent mails found
          </div>
        ) : (
          items.map((item) => {
            const status =
              STATUS_CONFIG[item.status] ??
              STATUS_CONFIG.delivered;

            const isAll =
              item.recipients === "all";

            return (
              <div
                key={item.id}
                className={
                  "flex items-start gap-2 px-3 py-2.5 border-b hover:bg-background transition " +
                  (selected?.id === item.id
                    ? "bg-accent border-l-2 border-l-primary"
                    : "")
                }
              >

                {/* CHECKBOX */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                  className="mt-1 shrink-0"
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                  />
                </div>

                {/* CONTENT */}
                <button
                  onClick={() => onSelect(item)}
                  className="flex-1 text-left"
                >
                  <div className="flex justify-between gap-2">

                    <div className="min-w-0 flex-1">

                      <p
                        className={
                          "text-sm truncate " +
                          (item.unread
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground")
                        }
                      >
                        {item.title}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">

                        <span className="truncate">
                          {item.sender || "You"}
                        </span>

                        <span className="text-slate-300">
                          ·
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {isAll ? (
                            <Globe size={11} />
                          ) : (
                            <Building2 size={11} />
                          )}

                          <span>
                            {item.recipientLabel}
                          </span>
                        </div>

                        <span className="text-slate-300">
                          ·
                        </span>

                        <span
                          className={
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full " +
                            status.class
                          }
                        >
                          {status.label}
                        </span>

                      </div>

                    </div>

                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {item.time}
                    </span>

                  </div>
                </button>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}