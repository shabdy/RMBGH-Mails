import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { RecipientPicker } from "./RecipientPicker";
import { useAnnouncements } from "../../../../context/AnnouncementContext";
import { Building2, Users, Globe } from "lucide-react";

/*
  recipientMode: "specific" | "department" | "all"
*/
export function MailHeader({
  recipients, setRecipients,
  subject, setSubject,
  errors = {}, setErrors,
  recipientMode, setRecipientMode,
}) {
  const { currentUser } = useAnnouncements();
  const clearError = (key) => setErrors?.((e) => ({ ...e, [key]: undefined }));

  const MODES = [
    { key: "specific",   label: "Specific",      icon: Users },
    { key: "department", label: "My Department", icon: Building2 },
    { key: "all",        label: "All Employees", icon: Globe },
  ];

  const handleModeChange = (mode) => {
    setRecipientMode(mode);
    setRecipients([]);
    clearError("to");
  };

  return (
    <div className="space-y-3">

      {/* ── FROM + TO side by side ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* FROM */}
        <div>
          <Label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</Label>
          <div className="h-11 flex items-center px-3.5 border rounded-xl bg-muted/40">
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-foreground">{currentUser?.name || "You"}</span>
              <span className="text-[11px] text-muted-foreground">{currentUser?.department || ""}</span>
            </div>
          </div>
        </div>

        {/* TO */}
        <div>
          <Label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</Label>

          {/* ── Mode segmented control ── */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/60 border mb-2">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleModeChange(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  recipientMode === key
                    ? "bg-background shadow-sm text-foreground border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <Icon size={12} className="shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>

          {/* Recipient display */}
          {recipientMode === "department" && (
            <div className="h-10 flex items-center gap-2 px-3.5 border rounded-xl bg-blue-500/8 border-blue-400/30">
              <Building2 size={13} className="text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400 truncate">
                All {currentUser?.department} Employees
              </span>
              <span className="text-[11px] text-blue-400 ml-auto shrink-0">Department</span>
            </div>
          )}

          {recipientMode === "all" && (
            <div className="h-10 flex items-center gap-2 px-3.5 border rounded-xl bg-green-500/8 border-green-400/30">
              <Globe size={13} className="text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">All Employees</span>
              <span className="text-[11px] text-green-400 ml-auto shrink-0">Organization</span>
            </div>
          )}

          {recipientMode === "specific" && (
            <>
              <RecipientPicker
                recipients={recipients}
                setRecipients={(val) => { setRecipients(val); clearError("to"); }}
              />
              {errors.to && <p className="text-xs text-red-500 mt-1">{errors.to}</p>}
            </>
          )}
        </div>
      </div>

      {/* ── SUBJECT ── */}
      <div>
        <Label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</Label>
        <Input
          className={`h-11 rounded-xl ${errors.subject ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          placeholder="Enter subject"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); clearError("subject"); }}
        />
        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
      </div>

    </div>
  );
}
