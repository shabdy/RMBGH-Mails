import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, iconBg, linkText, onClick }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {linkText && (
        <span className="text-xs text-primary font-medium hover:underline">{linkText}</span>
      )}
    </div>
  );
}
