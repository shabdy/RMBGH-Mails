import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import multer from "multer";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Uses system variable if present; otherwise defaults to a local development key
const JWT_SECRET = process.env.SESSION_SECRET || "local_dev_secret_key_backup_9988";
if (!process.env.SESSION_SECRET) {
  console.warn("[Warning]: SESSION_SECRET env not found. Falling back to local development key.");
}


const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safeExt = path.extname(file.originalname).slice(0, 10);
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024, files: 6 },
});

/* ─── Auth middleware ───
   Verifies the "Authorization: Bearer <token>" header and attaches the
   decoded identity to req.authUser = { id, role }. This is the ONLY
   source of truth for "who is making this request" on protected routes —
   client-supplied userId/role values in the body/query are never trusted
   for authorization decisions. */
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.authUser = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}
function isAdmin(authUser) {
  return authUser && ["admin", "superadmin"].includes(authUser.role);
}

/* ─── In-memory store ──────────────────────────────────────────────────────
   All JSON data is loaded into RAM at startup and served from there.
   Responses are sent immediately from memory; disk writes happen async
   in the background so they never block the event loop. */
const store = {};

function readJSON(file, fallback = []) {
  if (file in store) return store[file];           // already in memory → instant
  const p = path.join(DATA_DIR, file);
  try { store[file] = JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { store[file] = Array.isArray(fallback) ? [...fallback] : fallback; }
  return store[file];
}

function writeJSON(file, data) {
  store[file] = data;                              // update in-memory immediately
  // Persist to disk async — response is already sent by the time this finishes
  fs.writeFile(
    path.join(DATA_DIR, file),
    JSON.stringify(data, null, 2),
    (err) => { if (err) console.error(`[persist] ${file}:`, err); }
  );
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ─── Seed ─── */
const DEFAULT_USERS = [
  { id: 1, firstName: "IT",    lastName: "Superadmin", email: "superadmin@rmbgh.com", password: "admin123", role: "superadmin", status: "Active", department: "Information Technology", departmentId: "IT"  },
  { id: 2, firstName: "John",  lastName: "Doe",        email: "user@rmbgh.com",        password: "user123",  role: "user",       status: "Active", department: "Information Technology", departmentId: "IT"  },
  { id: 3, firstName: "Jane",  lastName: "Smith",      email: "staff@rmbgh.com",       password: "staff123", role: "user",       status: "Active", department: "Human Resources",        departmentId: "HR"  },
  { id: 4, firstName: "Maria", lastName: "Santos",     email: "maria.santos@rmbgh.com",password: "pass123",  role: "user",       status: "Pending",department: "Nursing",               departmentId: "NUR" },
  { id: 5, firstName: "Carlo", lastName: "Reyes",      email: "carlo.reyes@rmbgh.com", password: "pass123",  role: "user",       status: "Pending",department: "Laboratory",             departmentId: "LAB" },
  { id: 6, firstName: "Ana",   lastName: "Aquino",     email: "ana.aquino@rmbgh.com",  password: "pass123",  role: "user",       status: "Active", department: "Information Technology", departmentId: "IT"  },
  { id: 7, firstName: "Mark",  lastName: "Reyes",      email: "mark.reyes@rmbgh.com",  password: "pass123",  role: "user",       status: "Active", department: "Information Technology", departmentId: "IT"  },
];

const DEFAULT_MAILS = [
  {
    id: 1001,
    type: "mail",
    title: "Patient Safety Week Advisory",
    content: "<p>This is to inform all employees that <strong>Patient Safety Week</strong> will be celebrated from May 27 to May 31, 2026.</p><p>Please see the schedule below and ensure full participation from all departments.</p>",
    emailType: "memorandum", emailTypeLabel: "Memorandum",
    from: { id: 1, name: "Super Admin", email: "superadmin@rmbgh.com", department: "Administration", departmentId: "ADMIN" },
    recipients: [
      { id: 2, name: "John Doe",   email: "user@rmbgh.com",  department: "Information Technology", departmentId: "IT" },
      { id: 3, name: "Jane Smith", email: "staff@rmbgh.com", department: "Human Resources",         departmentId: "HR" },
    ],
    recipientType: "all",
    targetDepartmentId: null,
    date: "2026-07-01T09:00:00.000Z",
    attachment: null,
    readBy: [], pinnedBy: [], importantBy: [], deletedBy: [],
    priority: "urgent", status: "delivered",
  },
  {
    id: 1002,
    type: "mail",
    title: "IT Team: Weekly Sync Reminder",
    content: "<p>Hi IT Team,</p><p>This is a reminder for our <strong>weekly sync meeting</strong> this Friday at 3:00 PM in Conference Room B.</p><p>Please make sure to prepare your status updates before the meeting.</p>",
    emailType: "notice", emailTypeLabel: "Notice",
    from: { id: 2, name: "John Doe", email: "user@rmbgh.com", department: "Information Technology", departmentId: "IT" },
    recipients: [
      { id: 6, name: "Ana Aquino",  email: "ana.aquino@rmbgh.com",  department: "Information Technology", departmentId: "IT" },
      { id: 7, name: "Mark Reyes",  email: "mark.reyes@rmbgh.com",  department: "Information Technology", departmentId: "IT" },
    ],
    recipientType: "department",
    targetDepartmentId: "IT",
    date: "2026-06-30T10:00:00.000Z",
    attachment: null,
    readBy: [], pinnedBy: [], importantBy: [], deletedBy: [],
    priority: "normal", status: "delivered",
  },
  {
    id: 1003,
    type: "mail",
    title: "New Leave Policy Effective August 2026",
    content: "<p>Management announces updates to the <strong>Leave Policy</strong> effective August 1, 2026.</p><ul><li>Emergency Leave credits (5 days/year)</li><li>Maternity leave: 105 days</li><li>Paternity leave: 14 days</li></ul>",
    emailType: "circular", emailTypeLabel: "Circular",
    from: { id: 3, name: "Jane Smith", email: "staff@rmbgh.com", department: "Human Resources", departmentId: "HR" },
    recipients: [
      { id: 1, name: "Super Admin", email: "superadmin@rmbgh.com", department: "Administration",       departmentId: "ADMIN" },
      { id: 2, name: "John Doe",    email: "user@rmbgh.com",        department: "Information Technology", departmentId: "IT" },
    ],
    recipientType: "specific",
    targetDepartmentId: null,
    date: "2026-06-25T08:30:00.000Z",
    attachment: "Leave_Policy_Update_2026.pdf",
    readBy: [], pinnedBy: [], importantBy: [], deletedBy: [],
    priority: "normal", status: "delivered",
  },
  {
    id: 1004,
    type: "mail",
    title: "IT System Maintenance Notice",
    content: "<p>IT Team,</p><p>Scheduled maintenance this <strong>Saturday, July 5</strong> from 12:00 AM – 4:00 AM. Please log out of all hospital systems before midnight.</p>",
    emailType: "notice", emailTypeLabel: "Notice",
    from: { id: 7, name: "Mark Reyes", email: "mark.reyes@rmbgh.com", department: "Information Technology", departmentId: "IT" },
    recipients: [
      { id: 2, name: "John Doe",  email: "user@rmbgh.com",         department: "Information Technology", departmentId: "IT" },
      { id: 6, name: "Ana Aquino",email: "ana.aquino@rmbgh.com",   department: "Information Technology", departmentId: "IT" },
    ],
    recipientType: "department",
    targetDepartmentId: "IT",
    date: "2026-06-22T14:00:00.000Z",
    attachment: null,
    readBy: [{ id: 2, name: "John Doe", dept: "Information Technology", time: "2:30 PM", date: "Jun 22, 2026" }],
    pinnedBy: [], importantBy: [], deletedBy: [],
    priority: "important", status: "delivered",
  },
];

function initData() {
  // Seed files that don't exist yet (synchronous is fine — runs once at boot)
  const seed = (file, data) => {
    if (!fs.existsSync(path.join(DATA_DIR, file)))
      fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
  };
  seed("users.json",    DEFAULT_USERS);
  seed("mails.json",    DEFAULT_MAILS);
  seed("forwarded.json", []);
  seed("drafts.json",   []);
  seed("posts.json",    []);
  seed("auditLog.json", []);
  seed("notifications.json", []);

  // Pre-load everything into the in-memory store so the very first request
  // is already instant (no cold-read delay).
  readJSON("users.json",    DEFAULT_USERS);
  readJSON("mails.json",    DEFAULT_MAILS);
  readJSON("forwarded.json", []);
  readJSON("drafts.json",   []);
  readJSON("posts.json",    []);
  readJSON("auditLog.json", []);
  readJSON("notifications.json", []);
}
initData();

/* ─── Notifications ───────────────────────────────────────────────────────
   Fired whenever someone posts, comments, replies, reacts, pins, or files
   an event on the announcement feed. Recipients are looked up by id;
   the acting user is always excluded so nobody gets notified about their
   own activity. */
function addNotifications(recipientIds, { type, message, postId = null, commentId = null, replyId = null, fromId, fromName }) {
  const uniqueIds = [...new Set((recipientIds || []).map((id) => String(id)))]
    .filter((id) => id !== String(fromId));
  if (uniqueIds.length === 0) return;
  const notifications = readJSON("notifications.json", []);
  const now = new Date().toISOString();
  for (const uid of uniqueIds) {
    notifications.push({
      id: `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      userId: isNaN(Number(uid)) ? uid : Number(uid),
      type, message, postId, commentId, replyId,
      fromId, fromName,
      date: now,
      read: false,
    });
  }
  writeJSON("notifications.json", notifications);
}

// Every active user except the actor — used for feed-wide broadcasts
// (new posts, filed events).
function allOtherUserIds(actorId) {
  const users = readJSON("users.json", DEFAULT_USERS);
  return users
    .filter((u) => u.status === "Active" && String(u.id) !== String(actorId))
    .map((u) => u.id);
}

function findUser(id) {
  const users = readJSON("users.json", DEFAULT_USERS);
  return users.find((u) => String(u.id) === String(id)) || null;
}

/* ─── normalize ─── */
function normalizeMail(m) {
  const date = fmtDate(m.date);
  const time = fmtTime(m.date);
  const recipientLabel = m.recipientLabel || (() => {
    if (m.recipientType === "department") return `All ${m.from?.department || "Department"} Employees`;
    if (m.recipientType === "all")        return "All Employees";
    const recs = m.recipients || [];
    if (!recs.length) return "No recipients";
    if (recs.length === 1) return recs[0].name;
    return `${recs[0].name} +${recs.length - 1}`;
  })();
  return {
    ...m, date, time, recipientLabel,
    sender:       m.from?.name         || m.sender     || "",
    senderDept:   m.from?.department   || m.senderDept || "",
    senderDeptId: m.from?.departmentId || m.senderDeptId || "",
  };
}

function normalizeForwarded(f) {
  return { ...f, date: fmtDate(f.date), time: fmtTime(f.date), sender: f.from?.name, senderDept: f.from?.department };
}

/* Facebook-style reaction set shared by the announcement feed */
const REACTION_TYPES = ["like", "love", "haha", "wow", "sad"];

// Shared by posts, comments, and replies — all three carry a `reactions`
// array and need the same counts/myReaction derivation for the client.
function withReactionMeta(entity, userId) {
  const reactions = entity.reactions || [];
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const myReaction = userId
    ? reactions.find(r => String(r.userId) === String(userId))?.type || null
    : null;
  return { reactionCounts, myReaction, reactionCount: reactions.length };
}

function normalizeReply(r, userId) {
  return {
    ...r,
    date: fmtDate(r.date),
    time: fmtTime(r.date),
    ...withReactionMeta(r, userId),
  };
}

function normalizeComment(c, userId) {
  return {
    ...c,
    date: fmtDate(c.date),
    time: fmtTime(c.date),
    ...withReactionMeta(c, userId),
    replies: (c.replies || []).map(r => normalizeReply(r, userId)),
  };
}

function normalizePost(p, userId) {
  const reactions = p.reactions || [];
  const meta = withReactionMeta(p, userId);
  return {
    ...p,
    date: fmtDate(p.date),
    time: fmtTime(p.date),
    viewCount:      (p.viewedBy || []).length,
    commentCount:   (p.comments || []).length,
    ...meta,
    viewed: userId ? (p.viewedBy || []).some(v => String(v.id) === String(userId)) : false,
    comments: (p.comments || []).map(c => normalizeComment(c, userId)),
    viewedBy: (p.viewedBy || []).map(v => ({ ...v })),
  };
}

/* ═══════════════════ AUTH ═══════════════════ */
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON("users.json", DEFAULT_USERS);
  const user  = users.find(u => u.email.toLowerCase() === email?.toLowerCase()?.trim() && u.password === password);
  if (!user)                    return res.status(401).json({ success: false, error: "Invalid email or password" });
  if (user.status !== "Active") return res.status(403).json({ success: false, error: "Account not yet activated. Please wait for admin approval." });
  const { password: _, ...safe } = user;
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, user: safe, token });
});

app.post("/api/auth/register", (req, res) => {
  const users = readJSON("users.json", DEFAULT_USERS);
  if (users.find(u => u.email.toLowerCase() === req.body.email?.toLowerCase()))
    return res.status(409).json({ success: false, error: "Email already exists" });
 const newUser = {
  ...req.body,
  avatar: "",
  id: Date.now(),
  createdAt: new Date().toISOString(),
  role: "user",
  status: "Pending"
};
  users.push(newUser);
  writeJSON("users.json", users);
  const { password: _, ...safe } = newUser;
  res.json({ success: true, user: safe });
});

/* ═══════════════════ USERS ═══════════════════ */
app.get("/api/users", (req, res) => {
  const users = readJSON("users.json", DEFAULT_USERS).map(({ password: _, ...u }) => u);
  if (req.query.status) return res.json(users.filter(u => u.status === req.query.status));
  res.json(users);
});

app.patch("/api/users/:id", authenticate, (req, res) => {
  const targetId = req.params.id;
  const isSelf   = req.authUser.id == targetId;
  if (!isSelf && !isAdmin(req.authUser))
    return res.status(403).json({ error: "You do not have permission to edit this user" });

  const users = readJSON("users.json", DEFAULT_USERS);
  const idx   = users.findIndex(u => u.id == targetId);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  // Never let a PATCH change identity/security fields. Non-admins additionally
  // cannot change role/status (privilege escalation guard).
  const patch = { ...req.body };
  delete patch.id; delete patch.createdAt; delete patch.email; delete patch.password;
  if (!isAdmin(req.authUser)) { delete patch.role; delete patch.status; }

  users[idx] = { ...users[idx], ...patch };
  writeJSON("users.json", users);
  const { password: _, ...safe } = users[idx];
  res.json(safe);
});

app.delete("/api/users/:id", authenticate, (req, res) => {
  if (!isAdmin(req.authUser)) return res.status(403).json({ error: "Admin access required" });
  writeJSON("users.json", readJSON("users.json", DEFAULT_USERS).filter(u => u.id != req.params.id));
  res.json({ success: true });
});

/* Change password */
app.patch("/api/users/:id/password", authenticate, (req, res) => {
  if (req.authUser.id != req.params.id)
    return res.status(403).json({ error: "You can only change your own password" });
  const { currentPassword, newPassword } = req.body;
  const users = readJSON("users.json", DEFAULT_USERS);
  const idx   = users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  if (users[idx].password !== currentPassword)
    return res.status(403).json({ error: "Current password is incorrect" });
  users[idx].password = newPassword;
  writeJSON("users.json", users);
  res.json({ success: true });
});

app.get("/api/users/stats/summary", (req, res) => {
  const users = readJSON("users.json", DEFAULT_USERS);
  res.json({
    total:   users.length,
    active:  users.filter(u => u.status === "Active").length,
    pending: users.filter(u => u.status === "Pending").length,
  });
});

/* ═══════════════════ MAIL ═══════════════════ */

/*
  inbox visibility rules:
  - "specific"   : recipients[].id includes userId AND sender is not userId
  - "department" : targetDepartmentId === user's departmentId AND sender is not userId
  - "all"        : any active user except sender
*/
function isInboxVisible(m, userId, departmentId, userCreatedAt) {
  if ((m.deletedBy || []).includes(userId)) return false;
  if (m.from?.id === userId) return false; // sender sees it in Sent, not Inbox

  // Hide mails sent before this user's account was created
  if (userCreatedAt && new Date(m.date) < new Date(userCreatedAt)) return false;

  if (m.recipientType === "specific") {
    // Use loose equality to handle string vs number id mismatches
    return m.recipients?.some(r => String(r.id) === String(userId));
  }
  if (m.recipientType === "department") {
    return m.targetDepartmentId === departmentId;
  }
  if (m.recipientType === "all") {
    return true;
  }
  // fallback — legacy specific (string-normalize to match main check)
  return m.recipients?.some(r => String(r.id) === String(userId));
}

/* GET /api/mail?box=inbox|sent&userId=X */
app.get("/api/mail", (req, res) => {
  const userId       = parseInt(req.query.userId);
  const box          = req.query.box;
  const mails        = readJSON("mails.json", DEFAULT_MAILS);

  // Look up the requesting user's own record. departmentId is ALWAYS derived
  // from here, never trusted from the query string — otherwise any user
  // could pass ?departmentId=HR to read another department's mail.
  const users   = readJSON("users.json", DEFAULT_USERS);
  const reqUser = users.find(u => u.id === userId);
  const departmentId = reqUser?.departmentId || "";
  let userCreatedAt = reqUser?.createdAt || null;
  // Fallback: derive createdAt from timestamp-style ID for accounts without explicit createdAt
  if (!userCreatedAt && reqUser && reqUser.id > 1_000_000_000_000) {
    try { const t = new Date(reqUser.id); if (!isNaN(t)) userCreatedAt = t.toISOString(); } catch { /* skip */ }
  }

  let result;
  if (box === "inbox") {
    result = mails.filter(m => isInboxVisible(m, userId, departmentId, userCreatedAt));
  } else if (box === "sent") {
    result = mails.filter(m =>
      m.from?.id === userId &&
      !(m.deletedBy || []).includes(userId)
    );
  } else {
    result = mails.filter(m => !(m.deletedBy || []).includes(userId));
  }

  res.json(result.map(normalizeMail).sort((a, b) => new Date(b.date) - new Date(a.date)));
});

/* POST /api/mail */
app.post("/api/mail", (req, res) => {
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const body  = req.body;

  // For department mails, derive targetDepartmentId from the sender's stored
  // record — never trust the client-supplied value.
  let targetDepartmentId = body.targetDepartmentId || null;
  if (body.recipientType === "department") {
    const users  = readJSON("users.json", DEFAULT_USERS);
    const sender = users.find(u => u.id === body.userId || u.id === body.from?.id);
    targetDepartmentId = sender?.departmentId || null;
  }

  const newMail = {
    readBy: [], pinnedBy: [], importantBy: [], deletedBy: [],
    status: "delivered", priority: "normal",
    ...body,
    targetDepartmentId,
    id:   Date.now(),
    type: "mail",
    date: new Date().toISOString(),
  };
  mails.push(newMail);
  writeJSON("mails.json", mails);
  res.json(normalizeMail(newMail));
});

/* PATCH /api/mail/:id */
app.patch("/api/mail/:id", (req, res) => {
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const idx   = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  mails[idx] = { ...mails[idx], ...req.body };
  writeJSON("mails.json", mails);
  res.json(normalizeMail(mails[idx]));
});

/* POST /api/mail/:id/read */
app.post("/api/mail/:id/read", (req, res) => {
  const { userId, name, dept } = req.body;
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const idx   = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const already = (mails[idx].readBy || []).some(r => r.id === userId);
  if (!already) {
    mails[idx].readBy = [...(mails[idx].readBy || []), {
      id: userId, name, dept,
      time: fmtTime(new Date().toISOString()),
      date: fmtDate(new Date().toISOString()),
    }];
  }
  writeJSON("mails.json", mails);
  res.json(normalizeMail(mails[idx]));
});

/* POST /api/mail/:id/unread — reverse of /read; persists so it survives a refresh */
app.post("/api/mail/:id/unread", (req, res) => {
  const { userId } = req.body;
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const idx   = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  mails[idx].readBy = (mails[idx].readBy || []).filter(r => r.id !== userId);
  writeJSON("mails.json", mails);
  res.json(normalizeMail(mails[idx]));
});

/* POST /api/mail/:id/acknowledge */
app.post("/api/mail/:id/acknowledge", (req, res) => {
  const { userId, name, dept, signature } = req.body;
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const idx   = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const already = (mails[idx].acknowledgments || []).some(r => String(r.userId) === String(userId));
  if (!already) {
    const now = new Date().toISOString();
    mails[idx].acknowledgments = [...(mails[idx].acknowledgments || []), {
      userId, name, dept, signature,
      time: fmtTime(now),
      date: fmtDate(now),
    }];
  }
  writeJSON("mails.json", mails);
  res.json(normalizeMail(mails[idx]));
});

/* POST /api/mail/:id/pin */
app.post("/api/mail/:id/pin", (req, res) => {
  const { userId } = req.body;
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const idx   = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const pinned = mails[idx].pinnedBy || [];
  mails[idx].pinnedBy = pinned.includes(userId) ? pinned.filter(id => id !== userId) : [...pinned, userId];
  writeJSON("mails.json", mails);
  res.json(normalizeMail(mails[idx]));
});

/* POST /api/mail/:id/important */
app.post("/api/mail/:id/important", (req, res) => {
  const { userId } = req.body;
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  const idx   = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const imp = mails[idx].importantBy || [];
  mails[idx].importantBy = imp.includes(userId) ? imp.filter(id => id !== userId) : [...imp, userId];
  writeJSON("mails.json", mails);
  res.json(normalizeMail(mails[idx]));
});

/* DELETE /api/mail/:id?userId=X */
app.delete("/api/mail/:id", (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const mails  = readJSON("mails.json", DEFAULT_MAILS);
  const idx    = mails.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const del = mails[idx].deletedBy || [];
  if (!del.includes(userId)) mails[idx].deletedBy = [...del, userId];
  writeJSON("mails.json", mails);
  res.json({ success: true });
});

/* ─── FORWARDED ─── */
app.get("/api/forwarded", (req, res) => {
  const userId = parseInt(req.query.userId);
  const all    = readJSON("forwarded.json", []);
  res.json((userId ? all.filter(f => f.from?.id === userId) : all).map(normalizeForwarded).sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.post("/api/forwarded", (req, res) => {
  const fwds = readJSON("forwarded.json", []);
  const newFwd = { readBy: [], status: "delivered", ...req.body, id: Date.now(), type: "forwarded", date: new Date().toISOString() };
  fwds.push(newFwd);
  writeJSON("forwarded.json", fwds);
  res.json(normalizeForwarded(newFwd));
});

app.delete("/api/forwarded/:id", (req, res) => {
  writeJSON("forwarded.json", readJSON("forwarded.json", []).filter(f => f.id != req.params.id));
  res.json({ success: true });
});

/* ─── DRAFTS ─── */
app.get("/api/drafts", (req, res) => {
  const userId = parseInt(req.query.userId);
  const drafts = readJSON("drafts.json", []);
  res.json((userId ? drafts.filter(d => d.userId === userId) : drafts).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
});

app.post("/api/drafts", (req, res) => {
  const drafts = readJSON("drafts.json", []);
  const newDraft = { id: Date.now(), savedAt: new Date().toISOString(), ...req.body };
  drafts.push(newDraft);
  writeJSON("drafts.json", drafts);
  const d = newDraft;
  res.json({ ...d, date: fmtDate(d.savedAt), time: fmtTime(d.savedAt) });
});

app.patch("/api/drafts/:id", (req, res) => {
  const drafts = readJSON("drafts.json", []);
  const idx    = drafts.findIndex(d => d.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  drafts[idx] = { ...drafts[idx], ...req.body, savedAt: new Date().toISOString() };
  const d = drafts[idx];
  writeJSON("drafts.json", drafts);
  res.json({ ...d, date: fmtDate(d.savedAt), time: fmtTime(d.savedAt) });
});

app.delete("/api/drafts/:id", (req, res) => {
  writeJSON("drafts.json", readJSON("drafts.json", []).filter(d => d.id != req.params.id));
  res.json({ success: true });
});

/* ─── STATS ─── */
app.get("/api/mail/stats", (req, res) => {
  const userId       = parseInt(req.query.userId);
  const mails        = readJSON("mails.json", DEFAULT_MAILS);
  const drafts       = readJSON("drafts.json", []);
  const fwds         = readJSON("forwarded.json", []);
  const users   = readJSON("users.json", DEFAULT_USERS);
  const reqUser = users.find(u => u.id === userId);
  // departmentId is always derived from the user's own record, never trusted from the query string.
  const departmentId = reqUser?.departmentId || "";
  let userCreatedAt = reqUser?.createdAt || null;
  if (!userCreatedAt && reqUser && reqUser.id > 1_000_000_000_000) {
    try { const t = new Date(reqUser.id); if (!isNaN(t)) userCreatedAt = t.toISOString(); } catch { /* skip */ }
  }
  const inbox        = mails.filter(m => isInboxVisible(m, userId, departmentId, userCreatedAt));
  const unread       = inbox.filter(m => !(m.readBy || []).some(r => r.id === userId));
  res.json({
    inbox:     inbox.length,
    unread:    unread.length,
    sent:      mails.filter(m => m.from?.id === userId && !(m.deletedBy || []).includes(userId)).length,
    drafts:    drafts.filter(d => d.userId === userId).length,
    forwarded: fwds.filter(f => f.from?.id === userId).length,
  });
});

/* GET /api/admin/mail — all mails for admin overview (admin only) */
app.get("/api/admin/mail", authenticate, (req, res) => {
  if (!isAdmin(req.authUser)) return res.status(403).json({ error: "Forbidden" });
  const mails = readJSON("mails.json", DEFAULT_MAILS);
  res.json([...mails].sort((a, b) => new Date(b.date) - new Date(a.date)));
});

/* ═══════════════════ POSTS (Announcement Feed) ═══════════════════
   A lightweight social feed distinct from the mail/announcement system:
   any employee can post, everyone can see who viewed a post, comment,
   and react with a Facebook-style emoji set. */
app.get("/api/posts", (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  const posts  = readJSON("posts.json", []);
  res.json(
    [...posts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(p => normalizePost(p, userId))
  );
});

const POST_CATEGORIES = ["Updates", "Events", "Policies", "Alerts"];

/* An event post carries a small structured `event` block alongside the
   normal content/attachments — { title, date, time, location }. A post with
   an event block is always filed under the "Events" category so it's
   reliably surfaced on the Calendar page. */
function sanitizeEvent(event) {
  if (!event || typeof event !== "object") return null;
  const title = String(event.title || "").trim();
  const date  = String(event.date  || "").trim(); // yyyy-mm-dd
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return {
    title,
    date,
    time:     String(event.time || "").trim().slice(0, 5),
    location: String(event.location || "").trim().slice(0, 200),
  };
}

app.post("/api/posts", (req, res) => {
  const { content, from, userId, attachments, category, event } = req.body;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  const eventBlock = sanitizeEvent(event);
  if ((!content || !content.trim()) && !hasAttachments && !eventBlock)
    return res.status(400).json({ error: "Post content is required" });
  if (!from?.id && !userId) return res.status(400).json({ error: "Author is required" });
  const posts = readJSON("posts.json", []);
  const newPost = {
    id: Date.now(),
    content: (content || "").trim(),
    from: from || null,
    date: new Date().toISOString(),
    viewedBy: [],
    comments: [],
    reactions: [],
    attachments: hasAttachments ? attachments : [],
    category: eventBlock ? "Events" : (POST_CATEGORIES.includes(category) ? category : "Updates"),
    pinned: false,
    event: eventBlock,
  };
  posts.push(newPost);
  writeJSON("posts.json", posts);

  const authorId = userId || from?.id;
  addNotifications(allOtherUserIds(authorId), {
    type: eventBlock ? "event" : "post",
    message: eventBlock
      ? `${from?.name || "Someone"} filed a new event: ${eventBlock.title}`
      : `${from?.name || "Someone"} posted a new announcement`,
    postId: newPost.id,
    fromId: authorId,
    fromName: from?.name || "Someone",
  });

  res.json(normalizePost(newPost, userId || from?.id));
});

/* All filed events, flattened for the Calendar page — every post that
   carries an `event` block, newest-filed first. */
app.get("/api/events", (req, res) => {
  const posts = readJSON("posts.json", []);
  const events = posts
    .filter(p => p.event)
    .map(p => normalizePost(p, req.query.userId ? parseInt(req.query.userId) : null));
  res.json(events);
});

/* Who is allowed to pin a given post:
   - superadmin: anyone's post
   - admin (department Head): their own post, or any post from their department
   - user: their own post only
   All pinned posts stay visible to everyone regardless of who pinned them. */
function canPinPost(authUser, post) {
  const actingUser = findUser(authUser.id);
  const isOwnPost  = String(post.from?.id) === String(authUser.id);
  if (authUser.role === "superadmin") return true;
  if (authUser.role === "admin") {
    return isOwnPost || (actingUser?.departmentId && actingUser.departmentId === post.from?.departmentId);
  }
  return isOwnPost;
}

/* Pin/unpin — surfaces a post in the feed's pinned sidebar and keeps it
   sorted to the top. Permission scope depends on role (see canPinPost). */
app.patch("/api/posts/:id/pin", authenticate, (req, res) => {
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  if (!canPinPost(req.authUser, posts[idx]))
    return res.status(403).json({ error: "You don't have permission to pin this announcement" });
  posts[idx].pinned = !posts[idx].pinned;
  writeJSON("posts.json", posts);
  if (posts[idx].pinned && String(posts[idx].from?.id) !== String(req.authUser.id)) {
    const actor = findUser(req.authUser.id);
    addNotifications([posts[idx].from?.id], {
      type: "pin",
      message: `${actor ? `${actor.firstName} ${actor.lastName}` : "Someone"} pinned your announcement`,
      postId: posts[idx].id,
      fromId: req.authUser.id,
      fromName: actor ? `${actor.firstName} ${actor.lastName}` : "Someone",
    });
  }
  res.json(normalizePost(posts[idx], req.authUser.id));
});

/* Edit — only the original author may edit their own announcement. */
app.patch("/api/posts/:id", authenticate, (req, res) => {
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  if (String(posts[idx].from?.id) !== String(req.authUser.id))
    return res.status(403).json({ error: "Only the author can edit this announcement" });

  const { content, category, event } = req.body;
  const eventBlock = event !== undefined ? sanitizeEvent(event) : posts[idx].event;
  const hasAttachments = (posts[idx].attachments || []).length > 0;
  const nextContent = content !== undefined ? String(content).trim() : posts[idx].content;
  if (!nextContent && !hasAttachments && !eventBlock)
    return res.status(400).json({ error: "Post content is required" });

  posts[idx] = {
    ...posts[idx],
    content: nextContent,
    category: eventBlock ? "Events" : (POST_CATEGORIES.includes(category) ? category : posts[idx].category),
    event: eventBlock,
    edited: true,
    editedAt: new Date().toISOString(),
  };
  writeJSON("posts.json", posts);
  res.json(normalizePost(posts[idx], req.authUser.id));
});

/* Upload one or more files (images or documents) for use as post attachments.
   Returns metadata only — the caller embeds it in the post's `attachments`
   array when creating the post. Files are served back from /uploads/<filename>. */
app.post("/api/posts/upload", authenticate, upload.array("files", 6), (req, res) => {
  const files = (req.files || []).map(f => ({
    url:  `/uploads/${f.filename}`,
    name: f.originalname,
    type: f.mimetype,
    size: f.size,
  }));
  res.json({ files });
});

app.delete("/api/posts/:id", authenticate, (req, res) => {
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const isAuthor = String(posts[idx].from?.id) === String(req.authUser.id);
  if (!isAuthor && !isAdmin(req.authUser))
    return res.status(403).json({ error: "You can only delete your own posts" });
  const [removed] = posts.splice(idx, 1);
  writeJSON("posts.json", posts);
  // Best-effort cleanup of any uploaded files attached to the deleted post.
  for (const att of removed.attachments || []) {
    if (!att?.url?.startsWith("/uploads/")) continue;
    const filePath = path.join(UPLOAD_DIR, path.basename(att.url));
    fs.unlink(filePath, () => {});
  }
  res.json({ success: true });
});

app.post("/api/posts/:id/view", (req, res) => {
  const { userId, name } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const viewedBy = posts[idx].viewedBy || [];
  if (!viewedBy.some(v => String(v.id) === String(userId))) {
    const now = new Date().toISOString();
    posts[idx].viewedBy = [...viewedBy, { id: userId, name, date: now, time: now }];
    writeJSON("posts.json", posts);
  }
  res.json(normalizePost(posts[idx], userId));
});

app.post("/api/posts/:id/comments", (req, res) => {
  const { userId, name, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Comment text is required" });
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const comment = { id: Date.now(), userId, name, text: text.trim(), date: new Date().toISOString(), reactions: [], replies: [] };
  posts[idx].comments = [...(posts[idx].comments || []), comment];
  writeJSON("posts.json", posts);

  if (posts[idx].from?.id) {
    addNotifications([posts[idx].from.id], {
      type: "comment",
      message: `${name || "Someone"} commented on your announcement`,
      postId: posts[idx].id, commentId: comment.id,
      fromId: userId, fromName: name || "Someone",
    });
  }

  res.json(normalizePost(posts[idx], userId));
});

/* Reply to a specific comment — nested one level deep under `comment.replies`. */
app.post("/api/posts/:id/comments/:commentId/replies", (req, res) => {
  const { userId, name, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Reply text is required" });
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const comments  = posts[idx].comments || [];
  const commentIdx = comments.findIndex(c => c.id == req.params.commentId);
  if (commentIdx === -1) return res.status(404).json({ error: "Comment not found" });
  const reply = { id: Date.now(), userId, name, text: text.trim(), date: new Date().toISOString(), reactions: [] };
  const parentComment = comments[commentIdx];
  comments[commentIdx] = { ...parentComment, replies: [...(parentComment.replies || []), reply] };
  posts[idx].comments = comments;
  writeJSON("posts.json", posts);

  addNotifications([parentComment.userId, posts[idx].from?.id], {
    type: "reply",
    message: `${name || "Someone"} replied to a comment on ${String(parentComment.userId) === String(posts[idx].from?.id) ? "your" : "an"} announcement`,
    postId: posts[idx].id, commentId: parentComment.id, replyId: reply.id,
    fromId: userId, fromName: name || "Someone",
  });

  res.json(normalizePost(posts[idx], userId));
});

// Shared by the comment- and reply-react routes: toggles `userId`'s
// reaction within `entity.reactions`, matching the client's optimistic logic.
function toggleReactionOn(entity, userId, name, type) {
  const reactions   = entity.reactions || [];
  const existingIdx = reactions.findIndex(r => String(r.userId) === String(userId));
  if (existingIdx !== -1 && reactions[existingIdx].type === type) {
    return reactions.filter((_, i) => i !== existingIdx); // toggle off
  } else if (existingIdx !== -1) {
    return reactions.map((r, i) => (i === existingIdx ? { userId, name, type } : r));
  }
  return [...reactions, { userId, name, type }];
}

app.post("/api/posts/:id/comments/:commentId/react", (req, res) => {
  const { userId, name, type } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  if (!REACTION_TYPES.includes(type)) return res.status(400).json({ error: "Invalid reaction type" });
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const comments   = posts[idx].comments || [];
  const commentIdx = comments.findIndex(c => c.id == req.params.commentId);
  if (commentIdx === -1) return res.status(404).json({ error: "Comment not found" });
  const nextReactions = toggleReactionOn(comments[commentIdx], userId, name, type);
  const didAdd = nextReactions.some((r) => String(r.userId) === String(userId));
  comments[commentIdx] = { ...comments[commentIdx], reactions: nextReactions };
  posts[idx].comments = comments;
  writeJSON("posts.json", posts);

  if (didAdd) {
    addNotifications([comments[commentIdx].userId], {
      type: "react",
      message: `${name || "Someone"} reacted to your comment`,
      postId: posts[idx].id, commentId: comments[commentIdx].id,
      fromId: userId, fromName: name || "Someone",
    });
  }

  res.json(normalizePost(posts[idx], userId));
});

app.post("/api/posts/:id/comments/:commentId/replies/:replyId/react", (req, res) => {
  const { userId, name, type } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  if (!REACTION_TYPES.includes(type)) return res.status(400).json({ error: "Invalid reaction type" });
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const comments   = posts[idx].comments || [];
  const commentIdx = comments.findIndex(c => c.id == req.params.commentId);
  if (commentIdx === -1) return res.status(404).json({ error: "Comment not found" });
  const replies  = comments[commentIdx].replies || [];
  const replyIdx = replies.findIndex(r => r.id == req.params.replyId);
  if (replyIdx === -1) return res.status(404).json({ error: "Reply not found" });
  const nextReactions = toggleReactionOn(replies[replyIdx], userId, name, type);
  const didAdd = nextReactions.some((r) => String(r.userId) === String(userId));
  replies[replyIdx] = { ...replies[replyIdx], reactions: nextReactions };
  comments[commentIdx] = { ...comments[commentIdx], replies };
  posts[idx].comments = comments;
  writeJSON("posts.json", posts);

  if (didAdd) {
    addNotifications([replies[replyIdx].userId], {
      type: "react",
      message: `${name || "Someone"} reacted to your reply`,
      postId: posts[idx].id, commentId: comments[commentIdx].id, replyId: replies[replyIdx].id,
      fromId: userId, fromName: name || "Someone",
    });
  }

  res.json(normalizePost(posts[idx], userId));
});

app.post("/api/posts/:id/react", (req, res) => {
  const { userId, name, type } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  if (!REACTION_TYPES.includes(type)) return res.status(400).json({ error: "Invalid reaction type" });
  const posts = readJSON("posts.json", []);
  const idx   = posts.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const reactions  = posts[idx].reactions || [];
  const existingIdx = reactions.findIndex(r => String(r.userId) === String(userId));
  let didAdd = false;
  if (existingIdx !== -1 && reactions[existingIdx].type === type) {
    posts[idx].reactions = reactions.filter((_, i) => i !== existingIdx); // toggle off
  } else if (existingIdx !== -1) {
    reactions[existingIdx] = { userId, name, type };
    posts[idx].reactions = reactions;
    didAdd = true;
  } else {
    posts[idx].reactions = [...reactions, { userId, name, type }];
    didAdd = true;
  }
  writeJSON("posts.json", posts);

  if (didAdd && posts[idx].from?.id) {
    addNotifications([posts[idx].from.id], {
      type: "react",
      message: `${name || "Someone"} reacted to your announcement`,
      postId: posts[idx].id,
      fromId: userId, fromName: name || "Someone",
    });
  }

  res.json(normalizePost(posts[idx], userId));
});

/* ═══════════════════ NOTIFICATIONS ═══════════════════ */
app.get("/api/notifications", authenticate, (req, res) => {
  const notifications = readJSON("notifications.json", []);
  const mine = notifications
    .filter((n) => String(n.userId) === String(req.authUser.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 50)
    .map((n) => ({ ...n, date: n.date }));
  res.json(mine);
});

app.post("/api/notifications/:id/read", authenticate, (req, res) => {
  const notifications = readJSON("notifications.json", []);
  const idx = notifications.findIndex((n) => String(n.id) === String(req.params.id) && String(n.userId) === String(req.authUser.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  notifications[idx].read = true;
  writeJSON("notifications.json", notifications);
  res.json(notifications[idx]);
});

app.post("/api/notifications/read-all", authenticate, (req, res) => {
  const notifications = readJSON("notifications.json", []);
  let changed = false;
  const next = notifications.map((n) => {
    if (String(n.userId) === String(req.authUser.id) && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (changed) writeJSON("notifications.json", next);
  res.json({ success: true });
});

/* ═══════════════════ AUDIT LOG ═══════════════════ */
app.get("/api/audit", (req, res) => {
  const logs = readJSON("auditLog.json", []);
  res.json([...logs].reverse());
});

app.post("/api/audit", (req, res) => {
  const logs = readJSON("auditLog.json", []);
  const entry = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
  logs.push(entry);
  writeJSON("auditLog.json", logs);
  res.json(entry);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`RMBGH Mail API on port ${PORT}`));
