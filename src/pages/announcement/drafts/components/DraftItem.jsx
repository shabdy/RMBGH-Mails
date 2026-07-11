import { Globe, Building2 } from "lucide-react";

export function DraftItem({ draft, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(draft)}
      className={`w-full text-left px-5 py-3 border-b hover:bg-muted/50 transition ${
        selected?.id === draft.id
          ? "bg-accent border-l-2 border-l-primary"
          : ""
      }`}
    >
      <div className="flex justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium truncate text-foreground">
            {draft.title}
          </p>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>Draft</span>
            <span className="text-muted-foreground/30">·</span>
            <div className="flex items-center gap-1">
              {draft.toAll ? <Globe size={11} /> : <Building2 size={11} />}
              <span>{draft.recipientLabel || "No recipient"}</span>
            </div>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-amber-500">Unsaved Changes</span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[11px] text-muted-foreground">{draft.time}</span>
        </div>
      </div>
    </button>
  );
}
