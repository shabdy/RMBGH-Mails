import { useState, useContext, useEffect } from "react";
import {
  Bell,
  Monitor,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Check,
} from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { useTheme } from "next-themes";
import { useAccentColor } from "@/hooks/useAccentColor";
import { toast } from "sonner";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-primary" : "bg-slate-200"
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
    <div className="bg-background border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/40">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Icon size={15} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, control }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="ml-4 shrink-0">{control}</div>
    </div>
  );
}


const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark",  label: "Dark",  icon: Moon },
  { value: "system",label: "System",icon: Laptop },
];

const ACCENT_OPTIONS = [
  { value: "default", label: "Slate",  light: "#64748b", dark: "#94a3b8" },
  { value: "blue",    label: "Blue",   light: "#3b82f6", dark: "#60a5fa" },
  { value: "violet",  label: "Violet", light: "#7c3aed", dark: "#a78bfa" },
  { value: "pink",    label: "Pink",   light: "#ec4899", dark: "#f472b6" },
  { value: "rose",    label: "Rose",   light: "#f43f5e", dark: "#fb7185" },
  { value: "orange",  label: "Orange", light: "#f97316", dark: "#fb923c" },
  { value: "green",   label: "Green",  light: "#16a34a", dark: "#4ade80" },
  { value: "teal",    label: "Teal",   light: "#0d9488", dark: "#2dd4bf" },
  { value: "amber",   label: "Amber",  light: "#d97706", dark: "#fbbf24" },
];

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const { theme: activeTheme, setTheme: applyTheme } = useTheme();
  const { accent, setAccent } = useAccentColor();

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
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your preferences and app behavior
        </p>
      </div>

      {/* Appearance */}
      <Section
        title="Appearance"
        description="Customize how the app looks"
        icon={Monitor}
      >
        {/* ── Mode: Light / Dark / System ── */}
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-foreground mb-3">Mode</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  theme === value
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{label}</span>
                {theme === value && <Check size={11} className="text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Accent colour ── */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-1">Accent colour</p>
          <p className="text-xs text-muted-foreground mb-4">
            Changes buttons, highlights, and interactive elements throughout the app.
          </p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_OPTIONS.map(({ value, label, light, dark: darkSwatch }) => {
              const isActive = accent === value;
              const swatchColor = theme === "dark" ? darkSwatch : light;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setAccent(value);
                    toast.success(`Accent set to ${label}`);
                  }}
                  title={label}
                  className={`group relative flex flex-col items-center gap-1.5 transition-all`}
                >
                  {/* Swatch circle */}
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all shadow-sm ${
                      isActive
                        ? "border-foreground scale-110 shadow-md"
                        : "border-transparent hover:border-muted-foreground/40 hover:scale-105"
                    }`}
                    style={{ backgroundColor: swatchColor }}
                  >
                    {isActive && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="text-white drop-shadow"
                        style={{
                          filter: "drop-shadow(0 1px 1px rgba(0,0,0,.4))",
                        }}
                      />
                    )}
                  </span>
                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
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
            control={<span className="text-sm text-muted-foreground">{value}</span>}
          />
        ))}
      </Section>
    </div>
  );
}
