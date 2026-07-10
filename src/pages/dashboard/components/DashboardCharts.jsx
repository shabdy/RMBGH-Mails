import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const registrationData = [
  { date: "May 1",  users: 10 },
  { date: "May 6",  users: 18 },
  { date: "May 11", users: 14 },
  { date: "May 16", users: 30 },
  { date: "May 20", users: 24 },
];

const departmentData = [
  { name: "Information Technology", value: 35, color: "#3b82f6" },
  { name: "Human Resources",        value: 25, color: "#22c55e" },
  { name: "Administration",         value: 20, color: "#f59e0b" },
  { name: "Finance",                value: 10, color: "#a855f7" },
  { name: "Others",                 value: 10, color: "#6b7280" },
];

const announcementData = [
  { date: "May 1",  count: 5  },
  { date: "May 6",  count: 12 },
  { date: "May 11", count: 8  },
  { date: "May 16", count: 18 },
  { date: "May 20", count: 14 },
];

/* Use currentColor for chart grid/axes so they adapt to dark mode */
const GRID_COLOR    = "var(--color-border, #e2e8f0)";
const TICK_STYLE    = { fontSize: 10, fill: "var(--color-muted-foreground, #64748b)" };
const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-card, #fff)",
  border: "1px solid var(--color-border, #e2e8f0)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-foreground, #0f172a)",
};
const TOOLTIP_CURSOR_LINE = { stroke: "var(--color-border, #e2e8f0)", strokeWidth: 1 };
const TOOLTIP_CURSOR_BAR  = { fill: "var(--color-muted, #f1f5f9)" };

/* Shared header used by both time-series charts so the two cards line
   up pixel-for-pixel and both stretch to fill their grid row. */
function ChartHeader({ title, defaultRange = "This Month" }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-border flex-shrink-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <select className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground">
        <option>{defaultRange}</option>
        <option>Last Month</option>
      </select>
    </div>
  );
}

export default function UserRegistrationChart() {
  const totalThisMonth = registrationData.reduce((sum, d) => sum + d.users, 0);

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <ChartHeader title="User Registration" />
      <div className="flex items-baseline gap-2 px-4 pt-3">
        <span className="text-2xl font-bold text-foreground tabular-nums leading-none">{totalThisMonth}</span>
        <span className="text-xs text-muted-foreground">new users this month</span>
      </div>
      <div className="px-2 pb-3 pt-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={registrationData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="userRegFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={32} tickMargin={4} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={TOOLTIP_CURSOR_LINE} />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="url(#userRegFill)"
              dot={{ r: 3.5, fill: "#3b82f6", stroke: "var(--color-card, #fff)", strokeWidth: 2 }}
              activeDot={{ r: 5.5, stroke: "var(--color-card, #fff)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function UsersByDepartmentChart() {
  const total = departmentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Users by Department</h3>
      </div>
      <div className="flex flex-col items-center justify-center gap-5 px-4 py-5 sm:flex-row sm:justify-start">
        <div className="relative flex-shrink-0" style={{ width: 150, height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="var(--color-card, #fff)"
                strokeWidth={2}
              >
                {departmentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center total — common donut treatment */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-foreground leading-none">{total}%</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">total</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-1">
          {departmentData.map((dept, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: dept.color }}
              />
              <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">{dept.name}</span>
              <span className="text-xs font-semibold text-foreground tabular-nums flex-shrink-0">
                {dept.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnnouncementActivityChart() {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-5 pb-3">
        <select className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground ml-auto">
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>
      <div className="px-3 pb-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={announcementData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={TOOLTIP_CURSOR_BAR} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}