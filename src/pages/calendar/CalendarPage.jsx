import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { Avatar } from "@/pages/feed/components/Avatar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function todayKey() {
  const t = new Date();
  return toKey(t.getFullYear(), t.getMonth(), t.getDate());
}
function eventTimeLabel(timeStr) {
  if (!timeStr) return "";
  const [h, min] = timeStr.split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(min || 0).padStart(2, "0")} ${period}`;
}
function formatDisplayDate(key) {
  if (!key) return "";
  const [y, mo, d] = key.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// Distinct dot colors cycling per event index
const DOT_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-rose-500",
  "bg-amber-500",  "bg-emerald-500",
];

export default function CalendarPage() {
  const { posts } = usePosts();
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const events = useMemo(() => posts.filter((p) => p.event), [posts]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const p of events) {
      const k = p.event.date;
      if (!map[k]) map[k] = [];
      map[k].push(p);
    }
    return map;
  }, [events]);

  const thisMonthEvents = useMemo(() =>
    events.filter((p) => {
      const [ey, em] = p.event.date.split("-").map(Number);
      return ey === cursor.y && em - 1 === cursor.m;
    }),
  [events, cursor]);

  const upcoming = useMemo(() => {
    const key = todayKey();
    return [...events]
      .filter((p) => p.event.date >= key)
      .sort((a, b) =>
        (a.event.date + (a.event.time || "")).localeCompare(b.event.date + (b.event.time || ""))
      )
      .slice(0, 8);
  }, [events]);

  const { y, m } = cursor;
  const firstDay       = new Date(y, m, 1);
  const startWeekday   = firstDay.getDay();
  const daysInMonth    = new Date(y, m + 1, 0).getDate();
  const daysInPrevMonth = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++)
    cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, outside: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, outside: false, key: toKey(y, m, d) });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - (startWeekday + daysInMonth) + 1, outside: true });

  const changeMonth = (delta) =>
    setCursor((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const goToday = () => {
    const t = new Date();
    setCursor({ y: t.getFullYear(), m: t.getMonth() });
    setSelectedKey(todayKey());
  };

  const selectedEvents = eventsByDate[selectedKey] || [];
  const tKey = todayKey();

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-primary via-primary/85 to-violet-600 text-white px-6 py-7 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-6xl mx-auto flex items-end justify-between relative">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/60 flex items-center gap-1.5 mb-1">
              <Sparkles size={11} /> Events Calendar
            </p>
            <h1 className="text-4xl font-bold tracking-tight leading-none">
              {MONTHS[m]}
            </h1>
            <p className="text-white/50 text-sm mt-1.5 font-medium">{y}</p>
            {thisMonthEvents.length > 0 && (
              <p className="mt-2 text-xs text-white/70">
                {thisMonthEvents.length} event{thisMonthEvents.length !== 1 ? "s" : ""} this month
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={goToday}
              className="text-xs font-semibold bg-white text-primary rounded-xl px-4 py-2 shadow-sm hover:bg-white/90 transition"
            >
              Today
            </button>
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-5 items-start">

          {/* ── Month grid ── */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Weekday header row */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="text-center text-[11px] font-semibold text-muted-foreground tracking-wide py-3"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border/40">
              {cells.map((c, i) => {
                const dayEvents  = !c.outside ? (eventsByDate[c.key] || []) : [];
                const isToday    = c.key === tKey;
                const isSelected = c.key === selectedKey;

                return (
                  <div
                    key={i}
                    onClick={() => !c.outside && setSelectedKey(c.key)}
                    className={`relative min-h-[72px] p-1.5 transition select-none ${
                      c.outside
                        ? "bg-muted/20 cursor-default"
                        : isSelected
                        ? "bg-primary/8 cursor-pointer"
                        : "hover:bg-muted/40 cursor-pointer"
                    }`}
                  >
                    {/* Day number */}
                    <span
                      className={`w-7 h-7 flex items-center justify-center text-sm font-semibold rounded-full ml-auto transition ${
                        c.outside
                          ? "text-muted-foreground/25"
                          : isSelected && isToday
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                          : isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isToday
                          ? "bg-primary/15 text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {c.day}
                    </span>

                    {/* Event pills */}
                    {dayEvents.length > 0 && !c.outside && (
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev, di) => (
                          <div
                            key={di}
                            className="text-[9px] font-medium truncate rounded px-1 py-0.5 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 leading-tight"
                          >
                            {ev.event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[9px] text-muted-foreground px-1">
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bottom dot indicator */}
                    {dayEvents.length > 0 && !c.outside && (
                      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-0.5">
                        {dayEvents.slice(0, 3).map((_, di) => (
                          <span
                            key={di}
                            className={`w-1 h-1 rounded-full ${DOT_COLORS[di % DOT_COLORS.length]}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="space-y-4">
            {/* Selected day detail */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <CalendarDays size={14} className="text-primary flex-shrink-0" />
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {selectedKey === tKey ? "Today" : formatDisplayDate(selectedKey)}
                </h3>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                  <CalendarDays size={32} className="text-muted-foreground/15" />
                  <p className="text-xs">No events on this day</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {selectedEvents.map((p, idx) => (
                    <div key={p.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Colored left bar */}
                        <div
                          className={`w-1 self-stretch rounded-full flex-shrink-0 ${DOT_COLORS[idx % DOT_COLORS.length]}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {p.event.title}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {p.event.time && (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                                <Clock size={10} /> {eventTimeLabel(p.event.time)}
                              </span>
                            )}
                            {p.event.location && (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                                <MapPin size={10} /> {p.event.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <Avatar name={p.from?.name} size="sm" />
                            <span className="text-[10px] text-muted-foreground">Filed by {p.from?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming events */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" /> Upcoming
                </h3>
              </div>

              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                  <p className="text-xs">No upcoming events</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcoming.map((p, idx) => {
                    const [, em, ed] = p.event.date.split("-").map(Number);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          const [ey, emo] = p.event.date.split("-").map(Number);
                          setCursor({ y: ey, m: emo - 1 });
                          setSelectedKey(p.event.date);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition group"
                      >
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white flex flex-col items-center justify-center leading-none shadow-sm">
                          <span className="text-[8px] font-semibold uppercase tracking-wide">
                            {MONTHS[em - 1].slice(0, 3)}
                          </span>
                          <span className="text-sm font-bold">{ed}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition">
                            {p.event.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {eventTimeLabel(p.event.time) || "All day"}
                            {p.event.location ? ` · ${p.event.location}` : ""}
                          </p>
                        </div>
                        {/* Color accent dot */}
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[idx % DOT_COLORS.length]}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
