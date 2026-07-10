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
    { key: "specific",   label: "Specific",       icon: Users },
    { key: "department", label: "My Department",  icon: Building2 },
    { key: "all",        label: "All Employees",  icon: Globe },
  ];

  const handleModeChange = (mode) => {
    setRecipientMode(mode);
    setRecipients([]);
    clearError("to");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">

        {/* FROM */}
        <div>
          <Label className="mb-2 block">From</Label>
          <div className="h-[42px] flex items-center px-3 border rounded-md bg-muted/50">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{currentUser?.name || "You"}</span>
              <span className="text-xs text-muted-foreground">{currentUser?.department || ""}</span>
            </div>
          </div>
        </div>

        {/* TO */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>To</Label>

            {/* 3-way mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5 bg-muted/50 text-xs">
              {MODES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleModeChange(key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition font-medium whitespace-nowrap ${
                    recipientMode === key
                      ? "bg-background shadow-sm text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Department locked chip */}
          {recipientMode === "department" && (
            <div className="h-[42px] flex items-center gap-2 px-3 border rounded-md bg-blue-500/10 border-blue-500/30">
              <Building2 size={14} className="text-blue-500 shrink-0" />
              <div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  All {currentUser?.department} Employees
                </span>
                <span className="text-[11px] text-blue-500 ml-1.5">· Department only</span>
              </div>
            </div>
          )}

          {/* All employees locked chip */}
          {recipientMode === "all" && (
            <div className="h-[42px] flex items-center gap-2 px-3 border rounded-md bg-green-500/10 border-green-500/30">
              <Globe size={14} className="text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">All Employees</span>
                <span className="text-[11px] text-green-500 ml-1.5">· Entire organization</span>
              </div>
            </div>
          )}

          {/* Specific recipient picker */}
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

      {/* SUBJECT */}
      <div>
        <Label className="mb-2 block">Subject</Label>
        <Input
          className={`h-11 ${errors.subject ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          placeholder="Enter subject"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); clearError("subject"); }}
        />
        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
      </div>
    </div>
  );
}
