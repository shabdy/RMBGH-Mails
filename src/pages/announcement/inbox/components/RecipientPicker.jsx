import { useState, useRef, useEffect } from "react";
import { X, Search, ChevronDown, ChevronRight, Users } from "lucide-react";
import api from "../../../../services/apiClient";
import { useAnnouncements } from "../../../../context/AnnouncementContext";

function Avatar({ name = "?" }) {
  const initials = (name || "?").split(" ").map(w => w[0] || "").slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
      {initials}
    </div>
  );
}

export function RecipientPicker({ recipients, setRecipients }) {
  const { currentUser } = useAnnouncements();
  const [query, setQuery]           = useState("");
  const [open,  setOpen]            = useState(false);
  const [allUsers, setAllUsers]     = useState([]);
  const [expandedDepts, setExpandedDepts] = useState({});
  const inputRef     = useRef(null);
  const containerRef = useRef(null);

  /* Load active users from backend once */
  useEffect(() => {
    api.get("/users?status=Active").then(res => setAllUsers(res.data)).catch(() => {});
  }, []);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedIds = new Set(recipients.map(r => r.id));

  /* Exclude self */
  const pool = allUsers.filter(u => u.id !== currentUser?.id);

  /* Build department groups */
  const deptMap = pool.reduce((acc, u) => {
    const key = u.departmentId || "OTHER";
    if (!acc[key]) acc[key] = { label: u.department || key, employees: [] };
    acc[key].employees.push(u);
    return acc;
  }, {});

  const filtered = query.trim()
    ? pool.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email} ${u.department}`.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  const toRecipient = (u) => ({
    id:           u.id,
    name:         `${u.firstName} ${u.lastName}`,
    email:        u.email,
    department:   u.department   || "",
    departmentId: u.departmentId || "",
    role:         u.role         || "",
  });

  const addRecipient = (u) => {
    if (!selectedIds.has(u.id)) {
      setRecipients(prev => [...prev, toRecipient(u)]);
    }
    setQuery("");
    inputRef.current?.focus();
  };

  const removeRecipient = (id) => setRecipients(prev => prev.filter(r => r.id !== id));

  const addDepartment = (deptId) => {
    const toAdd = deptMap[deptId]?.employees.filter(e => !selectedIds.has(e.id)) || [];
    setRecipients(prev => [...prev, ...toAdd.map(toRecipient)]);
  };

  const toggleDept = (deptId) => setExpandedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));

  return (
    <div className="relative" ref={containerRef}>
      {/* TAGS + INPUT */}
      <div
        className="h-11 flex items-center gap-1.5 px-3 border rounded-md bg-background cursor-text focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        {recipients.slice(0, 3).map(r => (
          <span key={r.id} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs rounded-full pl-1.5 pr-1.5 py-0.5 shrink-0">
            <Avatar name={r.name} />
            <span className="font-medium whitespace-nowrap max-w-[80px] truncate">{r.name}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeRecipient(r.id); }} className="text-blue-400 hover:text-red-500 transition ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}

        {recipients.length > 3 && (
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-semibold shrink-0 cursor-pointer hover:bg-blue-700 transition"
            title={recipients.slice(3).map(r => r.name).join(", ")}
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          >
            +{recipients.length - 3}
          </span>
        )}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          placeholder={recipients.length === 0 ? "Search or select recipients..." : ""}
          className="flex-1 min-w-[80px] text-sm outline-none bg-transparent placeholder:text-slate-400"
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[380px] flex flex-col">
          {!query && (
            <div className="px-3 py-2 border-b flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <Search size={12} /> Type to search, or browse by department
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {filtered !== null ? (
              filtered.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground text-center">No users found</div>
              ) : (
                filtered.map(u => (
                  <button key={u.id} type="button" onClick={() => addRecipient(u)}
                    className={"w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-500/10 transition text-left " + (selectedIds.has(u.id) ? "opacity-40 pointer-events-none" : "")}>
                    <Avatar name={`${u.firstName} ${u.lastName}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.department} · {u.email}</p>
                    </div>
                    {selectedIds.has(u.id) && <span className="ml-auto text-[10px] text-blue-500 shrink-0">Added</span>}
                  </button>
                ))
              )
            ) : (
              Object.entries(deptMap).map(([deptId, { label, employees }]) => {
                const isExpanded = expandedDepts[deptId];
                const available  = employees.filter(e => !selectedIds.has(e.id)).length;
                return (
                  <div key={deptId}>
                    <div className="flex items-center px-3 py-2 border-b border-border">
                      <button type="button" onClick={() => toggleDept(deptId)}
                        className="flex items-center gap-2 flex-1 text-left hover:bg-muted/50 rounded-md px-1 py-0.5 transition">
                        {isExpanded ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
                        <span className="text-xs font-semibold text-foreground">{label}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{employees.length} people</span>
                      </button>
                      {available > 0 && (
                        <button type="button" onClick={() => addDepartment(deptId)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded transition shrink-0">
                          <Users size={11} className="inline mr-1" />Add all
                        </button>
                      )}
                    </div>
                    {isExpanded && employees.map(u => (
                      <button key={u.id} type="button" onClick={() => addRecipient(u)}
                        className={"w-full flex items-center gap-3 pl-8 pr-4 py-2 hover:bg-blue-500/10 transition text-left " + (selectedIds.has(u.id) ? "opacity-40 pointer-events-none" : "")}>
                        <Avatar name={`${u.firstName} ${u.lastName}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                        {selectedIds.has(u.id) && <span className="text-[10px] text-blue-500 shrink-0">Added</span>}
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {recipients.length > 0 && (
            <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground">{recipients.length} recipient{recipients.length !== 1 ? "s" : ""} selected</span>
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-primary font-medium hover:underline">Done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
