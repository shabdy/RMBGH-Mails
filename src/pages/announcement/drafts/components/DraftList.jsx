import { Search, FileEdit } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { DraftItem } from "./DraftItem";

export function DraftList({
  search,
  setSearch,
  drafts,
  selected,
  onSelect,
}) {
  return (
    <div className="w-[380px] border-r flex flex-col h-full overflow-hidden bg-white shrink-0">

      <div className="p-3 border-b shrink-0">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            placeholder="Search drafts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <FileEdit size={20} className="text-slate-200" />
            <span className="text-sm">No drafts saved</span>
          </div>
        ) : (
          drafts.map((draft) => (
            <DraftItem
              key={draft.id}
              draft={draft}
              selected={selected}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}