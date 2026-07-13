import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Clock,
  CalendarClock,
} from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { Avatar } from "@/pages/feed/components/Avatar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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
  const h12 = h % 12 || 12;
  return `${h12}:${String(min || 0).padStart(2, "0")} ${period}`;
}

export default function CalendarPage() {
  const { posts } = usePosts();
  const [cursor, setCursor] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; });
  const [selectedKey, setSelectedKey] = useState(todayKey());

  const events = useMemo(() => posts.filter((p) => p.event), [posts]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const p of events) {
      const key = p.event.date;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [events]);

  const upcoming = useMemo(() => {
    const key = todayKey();
    return [...events]
      .filter((p) => p.event.date >= key)
      .sort((a, b) => (a.event.date + (a.event.time || "")).localeCompare(b.event.date + (b.event.time || "")))
      .slice(0, 6);
  }, [events]);

  const { y, m } = cursor;
  const firstDay = new Date(y, m, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrevMonth = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, outside: false, key: toKey(y, m, d) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (startWeekday + daysInMonth) + 1, outside: true });
  }

  const changeMonth = (delta) => {
    setCursor((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const goToday = () => {
    const t = new Date();
    setCursor({ y: t.getFullYear(), m: t.getMonth() });
    setSelectedKey(todayKey());
  };

  const selectedEvents = eventsByDate[selectedKey] || [];
  const tKey = todayKey();

  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CalendarClock size={19} className="text-primary" /> Calendar
            </h1>
            <p className="text-sm text-muted-foreground">Events filed from announcements, all in one place.</p>
          </div>
          <button
            onClick={goToday}
            className="text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          {/* Month grid */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">{MONTHS[m]} {y}</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-center text-[11px] font-medium text-muted-foreground py-1.5">{wd}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((c, i) => {
                const dayEvents = !c.outside ? (eventsByDate[c.key] || []) : [];
                const isToday = c.key === tKey;
                const isSelected = c.key === selectedKey;
                return (
                  <button
                    key={i}
                    disabled={c.outside}
                    onClick={() => setSelectedKey(c.key)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
                      c.outside
                        ? "text-muted-foreground/30 cursor-default"
                        : isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isToday
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span>{c.day}</span>
                    {dayEvents.length > 0 && (
                      <span className={`flex gap-0.5 ${isSelected ? "text-primary-foreground" : ""}`}>
                        {dayEvents.slice(0, 3).map((_, di) => (
                          <span key={di} className={`w-1 h-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-violet-500"}`} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day details + upcoming */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {selectedKey === tKey ? "Today" : selectedKey}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No events filed for this day.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedEvents.map((p) => (
                    <div key={p.id} className="rounded-xl border border-violet-200 bg-violet-50/60 p-3">
                      <p className="text-sm font-semibold text-violet-900">{p.event.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {p.event.time && (
                          <span className="flex items-center gap-1 text-[11px] text-violet-700/80">
                            <Clock size={11} /> {eventTimeLabel(p.event.time)}
                          </span>
                        )}
                        {p.event.location && (
                          <span className="flex items-center gap-1 text-[11px] text-violet-700/80">
                            <MapPin size={11} /> {p.event.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Avatar name={p.from?.name} size="sm" />
                        <span className="text-[10px] text-muted-foreground">Filed by {p.from?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <CalendarDays size={14} className="text-primary" /> Upcoming
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No upcoming events.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        const [ey, em] = p.event.date.split("-").map(Number);
                        setCursor({ y: ey, m: em - 1 });
                        setSelectedKey(p.event.date);
                      }}
                      className="w-full flex items-center gap-3 text-left rounded-lg px-1.5 py-1.5 hover:bg-muted/50 transition group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex flex-col items-center justify-center flex-shrink-0 leading-none">
                        <span className="text-[8px] font-medium uppercase">{MONTHS[Number(p.event.date.split("-")[1]) - 1].slice(0, 3)}</span>
                        <span className="text-xs font-bold">{Number(p.event.date.split("-")[2])}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition">{p.event.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {eventTimeLabel(p.event.time) || "All day"}{p.event.location ? ` · ${p.event.location}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
