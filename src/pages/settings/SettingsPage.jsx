import { useState, useContext, useEffect } from "react";
import {
  Bell,
  Monitor,
  Globe,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Check,
} from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-slate-50/60">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Icon size={15} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, control }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="ml-4 shrink-0">{control}</div>
    </div>
  );
}


const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const { theme: activeTheme, setTheme: applyTheme } = useTheme();

  const load = (key, def) => {
    try {
      return JSON.parse(localStorage.getItem(`settings_${key}`)) ?? def;
    } catch {
      return def;
    }
  };
  const save = (key, val) =>
    localStorage.setItem(`settings_${key}`, JSON.stringify(val));

  const [theme, setThemeRaw] = useState(() => load("theme", "system"));
  const [notifInbox, setNotifInbox] = useState(() => load("notif_inbox", true));
  const [notifMention, setNotifMention] = useState(() =>
    load("notif_mention", true),
  );
  const [notifDept, setNotifDept] = useState(() => load("notif_dept", true));
  const [notifPending, setNotifPending] = useState(() =>
    load("notif_pending", ["admin","superadmin"].includes(user?.role)),
  );
  const [compact, setCompact] = useState(() => load("compact", false));
  const [showBadges, setShowBadges] = useState(() => load("badges", true));

  /* Sync display state with whatever next-themes reports on mount */
  useEffect(() => {
    if (activeTheme && activeTheme !== theme) setThemeRaw(activeTheme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTheme]);

  const setTheme = (v) => {
    setThemeRaw(v);
    save("theme", v);
    applyTheme(v);            /* actually change the theme via next-themes */
    toast.success(`Theme set to ${v.charAt(0).toUpperCase() + v.slice(1)}`);
  };
  const toggle = (key, setter, val) => {
    setter(val);
    save(key, val);
    toast.success("Setting saved");
  };

  return (
    <div className="max-w-8xl mx-auto py-8 px-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your preferences and app behavior
        </p>
      </div>

      {/* Appearance */}
      <Section
        title="Appearance"
        description="Customize how the app looks"
        icon={Monitor}
      >
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  theme === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{label}</span>
                {theme === value && (
                  <Check size={11} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <SettingRow
          label="Compact mode"
          description="Reduce spacing in mail lists for a denser view"
          control={
            <Toggle
              checked={compact}
              onChange={(v) => toggle("compact", setCompact, v)}
            />
          }
        />
        <SettingRow
          label="Show notification badges"
          description="Display unread count badges on sidebar items"
          control={
            <Toggle
              checked={showBadges}
              onChange={(v) => toggle("badges", setShowBadges, v)}
            />
          }
        />
      </Section>

      {/* Notifications */}
      <Section
        title="Notifications"
        description="Choose what you get notified about"
        icon={Bell}
      >
        <SettingRow
          label="New inbox messages"
          description="Get notified when you receive a new mail"
          control={
            <Toggle
              checked={notifInbox}
              onChange={(v) => toggle("notif_inbox", setNotifInbox, v)}
            />
          }
        />
        <SettingRow
          label="Mentions"
          description="Notify when someone sends you a mail directly"
          control={
            <Toggle
              checked={notifMention}
              onChange={(v) => toggle("notif_mention", setNotifMention, v)}
            />
          }
        />
        <SettingRow
          label="Department announcements"
          description="Get notified about mails sent to your department"
          control={
            <Toggle
              checked={notifDept}
              onChange={(v) => toggle("notif_dept", setNotifDept, v)}
            />
          }
        />
        {["admin","superadmin"].includes(user?.role) && (
          <SettingRow
            label="Pending user requests"
            description="Notify when a new account is awaiting approval"
            control={
              <Toggle
                checked={notifPending}
                onChange={(v) => toggle("notif_pending", setNotifPending, v)}
              />
            }
          />
        )}
      </Section>

      {/* Account info (read-only) */}
      <Section
        title="Account"
        description="Your account information"
        icon={ShieldCheck}
      >
        {[
          { label: "Email address", value: user?.email },
          { label: "Department", value: user?.department || "—" },
          {
            label: "Role",
            value: user?.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "—",
          },
          { label: "Status", value: user?.status },
        ].map(({ label, value }) => (
          <SettingRow
            key={label}
            label={label}
            control={<span className="text-sm text-slate-500">{value}</span>}
          />
        ))}
      </Section>
    </div>
  );
}
