import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

/* ── Design tokens ─────────────────────────────────────────────────── */
const GRID_COLOR         = "var(--color-border, #e2e8f0)";
const TICK_STYLE         = { fontSize: 10, fill: "var(--color-muted-foreground, #64748b)" };
const TOOLTIP_STYLE      = {
  backgroundColor: "var(--color-card, #fff)",
  border: "1px solid var(--color-border, #e2e8f0)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-foreground, #0f172a)",
};
const TOOLTIP_CURSOR_LINE = { stroke: "var(--color-border, #e2e8f0)", strokeWidth: 1 };
const TOOLTIP_CURSOR_BAR  = { fill: "var(--color-muted, #f1f5f9)" };
const DEPT_COLORS = ["#3b82f6","#22c55e","#f59e0b","#a855f7","#ef4444","#14b8a6","#f97316"];

/* ── Data builders ─────────────────────────────────────────────────── */
function buildMonthlyRegistrations(users) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      month: d.getMonth(),
      year: d.getFullYear(),
      users: 0,
    };
  });
  users.forEach((u) => {
    if (!u.createdAt) return;
    const d = new Date(u.createdAt);
    const slot = months.find(
      (m) => m.month === d.getMonth() && m.year === d.getFullYear()
    );
    if (slot) slot.users++;
  });
  return months;
}

function buildDeptDistribution(users) {
  const map = {};
  users.forEach((u) => {
    const dept = u.department || "Unknown";
    map[dept] = (map[dept] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: DEPT_COLORS[i % DEPT_COLORS.length] }));
}

function buildMailActivity(mails) {
  const map = {};
  mails.forEach((m) => {
    if (!m.date) return;
    const d = new Date(m.date);
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!map[key]) map[key] = { date: key, ts: d.getTime(), count: 0 };
    map[key].count++;
  });
  const sorted = Object.values(map).sort((a, b) => a.ts - b.ts).slice(-8);
  return sorted.length > 0
    ? sorted.map(({ date, count }) => ({ date, count }))
    : [{ date: "No data", count: 0 }];
}

/* ── UserRegistrationChart ─────────────────────────────────────────── */
export default function UserRegistrationChart({ users = [] }) {
  const data = buildMonthlyRegistrations(users);
  const totalThisMonth = data[data.length - 1]?.users ?? 0;

  return (
    <div className="flex h-[320px] flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-border flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">User Registrations</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Last 6 months</span>
      </div>
      <div className="flex items-baseline gap-2 px-4 pt-3">
        <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
          {totalThisMonth}
        </span>
        <span className="text-xs text-muted-foreground">new users this month</span>
      </div>
      <div className="flex-1 px-2 pb-3 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="userRegFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={32} tickMargin={4} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={TOOLTIP_CURSOR_LINE} />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="url(#userRegFill)"
              dot={{ r: 3.5, fill: "#3b82f6", stroke: "var(--color-card,#fff)", strokeWidth: 2 }}
              activeDot={{ r: 5.5, stroke: "var(--color-card,#fff)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── UsersByDepartmentChart ────────────────────────────────────────── */
export function UsersByDepartmentChart({ users = [] }) {
  const departmentData = buildDeptDistribution(users);
  const total = users.length;

  return (
    <div className="flex h-[320px] flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Users by Department</h3>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      {departmentData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
          No user data yet
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-8 px-6">
          <div className="relative flex-shrink-0" style={{ width: 150, height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="var(--color-card,#fff)"
                  strokeWidth={2}
                >
                  {departmentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground leading-none">{total}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">users</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-1">
            {departmentData.map((dept, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dept.color }}
                />
                <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">
                  {dept.name}
                </span>
                <span className="text-xs font-semibold text-foreground tabular-nums flex-shrink-0">
                  {dept.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AnnouncementActivityChart ─────────────────────────────────────── */
export function AnnouncementActivityChart({ mails = [] }) {
  const data = buildMailActivity(mails);

  return (
    <div className="px-3 pb-4 pt-2">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="date" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={TOOLTIP_CURSOR_BAR} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
