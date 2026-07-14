import { useEffect, useMemo, useState } from "react";
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
import rmbghBanner from "@/assets/rmbghbanner.png";

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
const PILL_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
];

export default function CalendarPage() {
  const { posts } = usePosts();
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward, used for slide animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const changeMonth = (delta) => {
    setDirection(delta);
    setCursor((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const goToday = () => {
    const t = new Date();
    setDirection(t.getFullYear() === y && t.getMonth() === m ? 1 : (t > new Date(y, m, 1) ? 1 : -1));
    setCursor({ y: t.getFullYear(), m: t.getMonth() });
    setSelectedKey(todayKey());
  };

  const selectedEvents = eventsByDate[selectedKey] || [];
  const tKey = todayKey();
  const monthKey = `${y}-${m}`;

  return (
    <div className="h-full overflow-y-auto">
      <style>{`
        @keyframes rmbgh-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, -10px) scale(1.05); }
        }
        @keyframes rmbgh-slide-in-right {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes rmbgh-slide-in-left {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes rmbgh-pop-in {
          from { opacity: 0; transform: scale(0.85) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rmbgh-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.45); }
          70% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes rmbgh-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rmbgh-month-anim {
          animation: ${direction >= 0 ? "rmbgh-slide-in-right" : "rmbgh-slide-in-left"} 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .rmbgh-cell {
          animation: rmbgh-pop-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .rmbgh-today-ring {
          animation: rmbgh-pulse-ring 2.2s ease-out infinite;
        }
        .rmbgh-fade-up {
          animation: rmbgh-fade-up 0.4s ease both;
        }
        .rmbgh-float-slow {
          animation: rmbgh-float 7s ease-in-out infinite;
        }
        .rmbgh-float-slower {
          animation: rmbgh-float 9s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>

      {/* ── Hero header with banner image ── */}
      <div className="relative overflow-hidden text-white px-6 py-9">
        {/* Banner image */}
        <img
          src={rmbghBanner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay for legibility + brand tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-violet-700/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Decorative floating circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none rmbgh-float-slow" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none rmbgh-float-slower" />
        <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-white/40 pointer-events-none rmbgh-float-slow" />
        <div className="absolute top-6 right-1/3 w-2 h-2 rounded-full bg-white/40 pointer-events-none rmbgh-float-slower" />

        <div className="max-w-[1800px] mx-auto flex items-end justify-between relative">
          <div key={monthKey} className="rmbgh-fade-up">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/70 flex items-center gap-1.5 mb-1">
              <Sparkles size={11} className="animate-pulse" /> Events Calendar
            </p>
            <h1 className="text-4xl font-bold tracking-tight leading-none drop-shadow-sm">
              {MONTHS[m]}
            </h1>
            <p className="text-white/60 text-sm mt-1.5 font-medium">{y}</p>
            {thisMonthEvents.length > 0 && (
              <p className="mt-2 text-xs text-white/80 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {thisMonthEvents.length} event{thisMonthEvents.length !== 1 ? "s" : ""} this month
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={goToday}
              className="text-xs font-semibold bg-white text-primary rounded-xl px-4 py-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Today
            </button>
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm transition-all duration-200"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm transition-all duration-200"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── Month grid ── */}
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* Weekday header row */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="text-center text-xs font-semibold text-muted-foreground tracking-wide py-3.5"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div key={monthKey} className="grid grid-cols-7 divide-x divide-y divide-border/40 rmbgh-month-anim">
              {cells.map((c, i) => {
                const dayEvents  = !c.outside ? (eventsByDate[c.key] || []) : [];
                const isToday    = c.key === tKey;
                const isSelected = c.key === selectedKey;

                return (
                  <div
                    key={i}
                    onClick={() => !c.outside && setSelectedKey(c.key)}
                    className={`rmbgh-cell relative min-h-[115px] p-2.5 transition-all duration-200 select-none ${
                      c.outside
                        ? "bg-muted/20 cursor-default"
                        : isSelected
                        ? "bg-primary/10 cursor-pointer"
                        : "hover:bg-muted/40 hover:scale-[1.02] cursor-pointer"
                    }`}
                    style={{ animationDelay: mounted ? `${Math.min(i * 8, 220)}ms` : "0ms" }}
                  >
                    {/* Day number */}
                    <span
                      className={`w-8 h-8 flex items-center justify-center text-base font-semibold rounded-full ml-auto transition-all duration-200 ${
                        c.outside
                          ? "text-muted-foreground/25"
                          : isSelected && isToday
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 rmbgh-today-ring"
                          : isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isToday
                          ? "bg-primary/15 text-primary rmbgh-today-ring"
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
                            className={`text-[10.5px] font-medium truncate rounded px-1.5 py-1 leading-tight ${PILL_COLORS[di % PILL_COLORS.length]}`}
                          >
                            {ev.event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[10px] text-muted-foreground px-1">
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
            <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
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
                <div key={selectedKey} className="divide-y divide-border">
                  {selectedEvents.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 rmbgh-fade-up"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
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
            <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
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
                          setDirection(new Date(ey, emo - 1, 1) >= new Date(y, m, 1) ? 1 : -1);
                          setCursor({ y: ey, m: emo - 1 });
                          setSelectedKey(p.event.date);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-all duration-200 group hover:pl-5"
                      >
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white flex flex-col items-center justify-center leading-none shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                          <span className="text-[8px] font-semibold uppercase tracking-wide">
                            {MONTHS[em - 1].slice(0, 3)}
                          </span>
                          <span className="text-sm font-bold">{ed}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {p.event.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {eventTimeLabel(p.event.time) || "All day"}
                            {p.event.location ? ` · ${p.event.location}` : ""}
                          </p>
                        </div>
                        {/* Color accent dot */}
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[idx % DOT_COLORS.length]} group-hover:scale-150 transition-transform duration-200`} />
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