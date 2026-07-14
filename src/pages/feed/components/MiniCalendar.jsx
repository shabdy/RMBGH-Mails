import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { useNavigate } from "react-router-dom";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function todayParts() {
  const t = new Date();
  return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
}
function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function MiniCalendar() {
  const { posts } = usePosts();
  const navigate = useNavigate();
  const today = todayParts();
  const [cursor, setCursor] = useState({ y: today.y, m: today.m });

  const eventDates = useMemo(() => {
    const set = new Set();
    for (const p of posts) if (p.event?.date) set.add(p.event.date);
    return set;
  }, [posts]);

  const { y, m } = cursor;
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: prevDays - firstWeekday + 1 + i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, outside: false, key: toKey(y, m, d) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (firstWeekday + daysInMonth) + 1, outside: true });
  }

  const changeMonth = (delta) =>
    setCursor((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const tKey = toKey(today.y, today.m, today.d);

  const upcomingEvents = useMemo(() => {
    return posts
      .filter((p) => p.event?.date && p.event.date >= tKey)
      .sort((a, b) => a.event.date.localeCompare(b.event.date))
      .slice(0, 2);
  }, [posts, tKey]);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-3">
      <style>{`
        @keyframes mc-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.45); }
          70% { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        .mc-today-ring { animation: mc-pulse-ring 2.2s ease-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <CalendarClock size={11} className="text-white" />
          </div>
          Events
        </h2>
        <button
          onClick={() => navigate("/calendar")}
          className="text-[11px] font-medium text-primary hover:underline transition"
        >
          View all →
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-foreground">
          {MONTHS[m].slice(0, 3)} {y}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-md hover:bg-violet-50 hover:text-violet-600 transition-colors text-muted-foreground"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded-md hover:bg-violet-50 hover:text-violet-600 transition-colors text-muted-foreground"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-0.5">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">
            {wd}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c, i) => {
          const hasEvent = !c.outside && eventDates.has(c.key);
          const isToday = c.key === tKey;
          return (
            <button
              key={i}
              disabled={c.outside}
              onClick={() => !c.outside && hasEvent && navigate("/calendar")}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium transition-all duration-150 ${
                c.outside
                  ? "text-muted-foreground/25 cursor-default"
                  : isToday
                  ? "bg-primary text-primary-foreground shadow-sm mc-today-ring"
                  : hasEvent
                  ? "text-violet-700 hover:bg-violet-50 hover:scale-110 cursor-pointer"
                  : "text-foreground hover:bg-muted/50 hover:scale-110"
              }`}
            >
              {c.day}
              {hasEvent && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Upcoming events list */}
      {upcomingEvents.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          {upcomingEvents.map((p) => {
            const [, em, ed] = p.event.date.split("-");
            return (
              <button
                key={p.id}
                onClick={() => navigate("/calendar")}
                className="w-full flex items-center gap-2.5 text-left rounded-lg px-1 py-1 hover:bg-violet-50 hover:translate-x-0.5 transition-all duration-150 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white flex flex-col items-center justify-center flex-shrink-0 leading-none shadow-sm group-hover:scale-105 transition-transform">
                  <span className="text-[8px] font-medium uppercase">
                    {MONTHS[Number(em) - 1].slice(0, 3)}
                  </span>
                  <span className="text-[11px] font-bold">{Number(ed)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {p.event.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {p.event.time || "All day"}{p.event.location ? ` · ${p.event.location}` : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {upcomingEvents.length === 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground text-center">No upcoming events.</p>
      )}
    </div>
  );
}