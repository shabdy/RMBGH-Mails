import { useState, useEffect } from "react";
import {
  Globe,
  Building2,
  CornerUpRight,
  Trash2,
} from "lucide-react";

import { Input } from "../../../../components/ui/input";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Button } from "../../../../components/ui/button";

export function ForwardList({
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
      prev.filter((id) => items.some((item) => item.id === id))
    );
  }, [items]);

  const toggleItem = (e, id) => {
    e.stopPropagation();

    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (
      items.length > 0 &&
      selectedIds.length === items.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="w-[380px] border-r flex flex-col h-full overflow-hidden bg-white shrink-0">

      {/* SEARCH + BULK ACTIONS */}
      <div className="p-3 border-b shrink-0 space-y-3">

        <Input
          placeholder="Search forwarded mails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {items.length > 0 && (
          <div className="flex items-center justify-between px-1">

            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  items.length > 0 &&
                  selectedIds.length === items.length
                }
                onCheckedChange={toggleAll}
              />

              <button
                onClick={toggleAll}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {selectedIds.length === items.length &&
                items.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">

                <span className="text-xs text-slate-500">
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
          <div className="p-6 text-sm text-slate-400">
            No forwarded mails found
          </div>
        ) : (
          items.map((item) => {
            const isAll = item.forwardedTo === "all";

            return (
              <div
                key={item.id}
                className={
                  "flex items-start gap-2 px-3 py-2.5 border-b hover:bg-slate-50 transition " +
                  (selected?.id === item.id
                    ? "bg-blue-50 border-l-2 border-l-blue-600"
                    : "")
                }
              >
                {/* CHECKBOX */}
                <div
                  onClick={(e) => toggleItem(e, item.id)}
                  className="mt-1 shrink-0"
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                  />
                </div>

                {/* ITEM */}
                <button
                  onClick={() => onSelect(item)}
                  className="flex-1 text-left"
                >
                  <div className="flex justify-between gap-2">

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-1.5">
                        <CornerUpRight
                          size={11}
                          className="text-slate-400 shrink-0"
                        />

                        <p className="text-sm font-medium truncate text-slate-700">
                          {item.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">

                        <span className="truncate">
                          {item.originalSender}
                        </span>

                        <span className="text-slate-300 shrink-0">
                          ·
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {isAll ? (
                            <Globe size={11} />
                          ) : (
                            <Building2 size={11} />
                          )}

                          <span>
                            {item.forwardedToLabel}
                          </span>
                        </div>

                        <span className="text-slate-300 shrink-0">
                          ·
                        </span>

                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500">
                          Forwarded
                        </span>

                      </div>

                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
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