import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuickActionCard({ label, sub, icon: Icon, iconBg, textColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left",
        "transition-all hover:shadow-md hover:border-primary/30"
      )}
    >
      <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg", iconBg)}>
        <Icon className={cn("h-4 w-4", textColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      <ChevronRight
        size={15}
        className="flex-shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}