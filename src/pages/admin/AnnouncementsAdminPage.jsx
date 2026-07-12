import { useState, useEffect, useMemo, useContext } from "react";
import {
  Search,
  Globe,
  Building2,
  User,
  Megaphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { AuthContext } from "@/context/authContext";
import api from "@/services/apiClient";

const PAGE_SIZE = 10;

const TYPE_CONFIG = {
  all: {
    label: "Broadcast",
    icon: Globe,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  department: {
    label: "Department",
    icon: Building2,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  specific: {
    label: "Direct",
    icon: User,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

function Avatar({ name }) {
  const initials =
    (name || "?")
      .split(" ")
      .map((w) => w[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  const COLORS = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  const color = COLORS[(name || "").charCodeAt(0) % COLORS.length];
  return (
    <div
      className={`w-8 h-8 rounded-full ${color} text-white text-xs font-semibold flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AnnouncementsAdminPage() {
  const { user } = useContext(AuthContext);
  const [mails, setMails] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "" = show all
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/admin/mail?userId=${user.id}`)
      .then((res) => setMails(res.data))
      .catch(() => {});
  }, [user?.id]);

  const filtered = useMemo(() => {
    return mails.filter((m) => {
      if (typeFilter && m.recipientType !== typeFilter) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      const sender = (m.from?.name || m.sender || "").toLowerCase();
      const title = (m.title || "").toLowerCase();
      const dept = (m.from?.department || "").toLowerCase();
      return sender.includes(q) || title.includes(q) || dept.includes(q);
    });
  }, [mails, search, typeFilter]);

  /* Reset to page 1 whenever search or type filter changes */
  useEffect(() => setPage(1), [search, typeFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const stats = {
    total: mails.length,
    all: mails.filter((m) => m.recipientType === "all").length,
    dept: mails.filter((m) => m.recipientType === "department").length,
    direct: mails.filter((m) => m.recipientType === "specific").length,
  };

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Announcements Hub</h1>
        <p className="text-sm text-muted-foreground">
          All announcements and mails across the organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "bg-slate-100 text-slate-600",
          },
          {
            label: "Broadcasts",
            value: stats.all,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Dept-wide",
            value: stats.dept,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Direct Mail",
            value: stats.direct,
            color: "bg-purple-100 text-purple-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by sender, title, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
          {[
            { key: "", label: "All" },
            { key: "all", label: "Broadcast" },
            { key: "department", label: "Dept-wide" },
            { key: "specific", label: "Direct" },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => setTypeFilter(f.key)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                typeFilter === f.key
                  ? "bg-white shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {mails.length} records
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Megaphone size={32} className="text-muted-foreground/20" />
            <p className="text-sm font-medium">No announcements found</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Sender
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Recipients
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Read by
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((m) => {
                  const senderName = m.from?.name || m.sender || "Unknown";
                  const senderDept = m.from?.department || "Unknown";
                  const cfg =
                    TYPE_CONFIG[m.recipientType] || TYPE_CONFIG.specific;
                  const TypeIcon = cfg.icon;
                  const recipientLabel =
                    m.recipientType === "all"
                      ? "All employees"
                      : m.recipientType === "department"
                        ? m.from?.department ||
                          m.targetDepartmentId ||
                          "Department"
                        : `${(m.recipients || []).length} person(s)`;

                  return (
                    <tr
                      key={m.id}
                      onClick={() =>
                        setSelected(selected?.id === m.id ? null : m)
                      }
                      className={`hover:bg-muted/20 transition-colors cursor-pointer ${selected?.id === m.id ? "bg-muted/30" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={senderName} />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-xs truncate">
                              {senderName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {senderDept}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-foreground truncate max-w-[200px]">
                          {m.title}
                        </p>
                        {m.emailTypeLabel && (
                          <span className="text-[10px] text-muted-foreground">
                            {m.emailTypeLabel}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}
                        >
                          <TypeIcon size={9} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {recipientLabel}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {(m.readBy || []).length}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-foreground">
                          {formatDate(m.date)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatTime(m.date)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <PaginationBar
          page={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />

        {/* Expandable preview */}
        {selected && (
          <div className="border-t border-border bg-muted/20 px-6 py-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {selected.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  From {selected.from?.name || selected.sender} ·{" "}
                  {formatDate(selected.date)} at {formatTime(selected.date)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
              >
                Close ✕
              </button>
            </div>
            <div
              className="prose prose-sm max-w-none text-xs text-foreground/80"
              dangerouslySetInnerHTML={{
                __html: selected.content || "<em>No content</em>",
              }}
            />
            {selected.attachment && typeof selected.attachment === "string" && (
              <p className="text-xs text-muted-foreground mt-3">
                📎 {selected.attachment}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
