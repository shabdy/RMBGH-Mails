import { Users } from "lucide-react";

export function RecipientDisplay({ recipients, recipientLabel, onShowAll, label = "To" }) {
  if (Array.isArray(recipients) && recipients.length > 0 && typeof recipients[0] === "object") {
    const SHOW = 3;
    const shown = recipients.slice(0, SHOW);
    const overflow = recipients.length - SHOW;
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap">
        <Users size={11} className="shrink-0" />
        <span className="text-slate-400 mr-0.5">{label}:</span>
        {shown.map((r, i) => (
          <span key={r?.id || i} className="text-slate-700 font-medium">
            {r?.name || "Unknown"}{i < shown.length - 1 ? "," : ""}
          </span>
        ))}
        {overflow > 0 && (
          <button
            onClick={onShowAll}
            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-semibold hover:bg-blue-200 transition"
          >
            +{overflow} more
          </button>
        )}
      </div>
    );
  }

  const display = recipientLabel
    || (recipients === "all" ? "All Employees"
      : typeof recipients === "string" ? recipients
      : "My Department");

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Users size={11} />
      <span className="text-slate-400">{label}:</span>
      <span className="text-slate-700">{display}</span>
    </div>
  );
}