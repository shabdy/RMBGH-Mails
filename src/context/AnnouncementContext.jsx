import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { AuthContext } from "./authContext";

const AnnouncementContext = createContext(null);

export function AnnouncementProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [inbox,     setInbox]     = useState([]);
  const [sent,      setSent]      = useState([]);
  const [forwarded, setForwarded] = useState([]);
  const [drafts,    setDrafts]    = useState([]);
  const [loading,   setLoading]   = useState(false);

  /* ─── Build a plain currentUser object from AuthContext ─── */
  const buildCurrentUser = useCallback(() => {
    if (!user) return null;
    return {
      id:           user.id,
      name:         `${user.firstName} ${user.lastName}`,
      email:        user.email,
      department:   user.department   || "Unknown",
      departmentId: user.departmentId || "NONE",
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.firstName, user?.lastName, user?.email, user?.department, user?.departmentId]);

  /* ─── Enrich raw backend mail with derived UI fields ─── */
  const enrich = useCallback((m) => {
    const cu     = buildCurrentUser();
    const unread = cu ? !(m.readBy || []).some(r => r.id === cu.id) : true;
    return {
      ...m,
      unread,
      sender:       m.from?.name         || m.sender     || "",
      senderDept:   m.from?.department   || m.senderDept || "",
      senderDeptId: m.from?.departmentId || m.senderDeptId || "",
    };
  }, [buildCurrentUser]);

  /* ─── Fetch all mail data from backend ─── */
  const loadAll = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id) return;
    // eslint-disable-next-line no-unused-vars
    void silent; // loading UI removed — data loads silently always
    const deptId = user.departmentId || "";
    try {
      const [inboxRes, sentRes, fwdRes, draftsRes] = await Promise.all([
        api.get(`/mail?box=inbox&userId=${user.id}&departmentId=${deptId}`),
        api.get(`/mail?box=sent&userId=${user.id}`),
        api.get(`/forwarded?userId=${user.id}`),
        api.get(`/drafts?userId=${user.id}`),
      ]);
      setInbox(inboxRes.data.map(enrich));
      setSent(sentRes.data.map(enrich));
      setForwarded(fwdRes.data);
      setDrafts(draftsRes.data);
    } catch (err) {
      console.error("Failed to load mail data:", err);
    }
  }, [user?.id, user?.departmentId, enrich]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ─── Derived ─── */
  const unreadCount  = inbox.filter(m => m.unread).length;
  const pinnedIds    = user ? inbox.filter(m => (m.pinnedBy || []).includes(user.id)).map(m => m.id) : [];
  const importantIds = user ? [
    ...inbox.filter(m => (m.importantBy || []).includes(user.id)).map(m => m.id),
    ...sent.filter(m  => (m.importantBy || []).includes(user.id)).map(m => m.id),
  ] : [];

  /* ─── SEND MAIL ─── */
  const sendMail = async ({ title, content, recipients, emailType, emailTypeLabel, attachment, recipientType, targetDepartmentId, requiresReceipt }) => {
    const cu = buildCurrentUser();
    if (!cu) return;

    const type   = recipientType || "specific";
    const deptId = targetDepartmentId || (type === "department" ? cu.departmentId : null);

    const payload = {
      title,
      content,
      recipients:         recipients || [],
      recipientType:      type,
      targetDepartmentId: deptId,
      emailType:          emailType      || "",
      emailTypeLabel:     emailTypeLabel || "",
      attachment:         attachment     || null,
      requiresReceipt:    !!requiresReceipt,
      from:               cu,
      userId:             cu.id,
      priority:           "normal",
    };

    // Optimistic: add to sent immediately so the sender sees it right away
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic = enrich({
      ...payload, id: tempId, type: "mail", date: now,
      readBy: [], pinnedBy: [], importantBy: [], deletedBy: [],
      status: "delivered", _pending: true,
    });
    setSent(prev => [optimistic, ...prev]);

    try {
      const { data } = await api.post("/mail", payload);
      setSent(prev => prev.map(m => m.id === tempId ? enrich(data) : m));
    } catch (err) {
      console.error("Send mail failed:", err);
      setSent(prev => prev.filter(m => m.id !== tempId));
    }
  };

  /* ─── SAVE DRAFT ─── */
  const saveDraft = async ({ id, title, content, recipients, emailType, emailTypeLabel, attachment, subject, recipientType, targetDepartmentId }) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    const payload = {
      title:              title || subject || "(No subject)",
      subject:            subject || title || "(No subject)",
      content:            content        || "",
      recipients:         recipients     || [],
      recipientType:      recipientType  || "specific",
      targetDepartmentId: targetDepartmentId || null,
      emailType:          emailType      || "",
      emailTypeLabel:     emailTypeLabel || "",
      attachment:         attachment     || null,
      from:               cu,
      userId:             cu.id,
      sender:             cu.name,
    };
    try {
      let saved;
      if (id) {
        const { data } = await api.patch(`/drafts/${id}`, payload);
        saved = data;
        setDrafts(prev => prev.map(d => d.id === id ? saved : d));
      } else {
        const { data } = await api.post("/drafts", payload);
        saved = data;
        setDrafts(prev => [saved, ...prev]);
      }
      return saved?.id;
    } catch (err) { console.error("Save draft failed:", err); }
  };

  const deleteDraft = async (id) => {
    try {
      await api.delete(`/drafts/${id}`);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (err) { console.error(err); }
  };

  /* ─── FORWARD ─── */
  const forwardMail = async ({ original, forwardedTo, forwardedToLabel, note, attachment }) => {
    const cu = buildCurrentUser();
    if (!cu) return;

    const finalAttachment = attachment || original.attachment || null;
    const noteHtml        = note || "";
    const combinedContent = noteHtml
      ? `${noteHtml}<hr style="margin:12px 0;border:none;border-top:1px solid #e2e8f0"/><p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Original Message — from ${original.sender}</p>${original.content || ""}`
      : `<p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Original Message — from ${original.sender}</p>${original.content || ""}`;

    const fwdPayload = {
      title:            original.title,
      content:          original.content,
      originalSender:   original.sender,
      originalTitle:    original.title,
      forwardedTo:      forwardedTo      || [],
      forwardedToLabel: forwardedToLabel || "",
      note:             noteHtml,
      attachment:       finalAttachment,
      from:             cu,
      userId:           cu.id,
      sender:           cu.name,
      senderDept:       cu.department,
    };

    // Optimistic: add forwarded entry immediately so sender sees it right away
    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const optimistic = {
      ...fwdPayload, id: tempId, type: "forwarded",
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      _pending: true,
    };
    setForwarded(prev => [optimistic, ...prev]);

    try {
      /* 1 – save sender's forwarded record */
      const { data } = await api.post("/forwarded", fwdPayload);
      setForwarded(prev => prev.map(f => f.id === tempId ? data : f));

      /* 2 – deliver to each recipient's inbox */
      const specificRecipients = Array.isArray(forwardedTo) ? forwardedTo : [];
      if (specificRecipients.length > 0) {
        const mailPayload = {
          title:              `Fwd: ${original.title}`,
          content:            combinedContent,
          recipients:         specificRecipients,
          recipientType:      "specific",
          targetDepartmentId: null,
          emailType:          "forwarded",
          emailTypeLabel:     "Forwarded",
          attachment:         finalAttachment,
          from:               cu,
          userId:             cu.id,
          priority:           "normal",
          isForwarded:        true,
          originalSender:     original.sender,
        };
        await api.post("/mail", mailPayload);
      }
    } catch (err) {
      console.error("Forward failed:", err);
      setForwarded(prev => prev.filter(f => f.id !== tempId));
    }
  };

  /* ─── DELETE ─── */
  const deleteFromInbox = async (id) => {
    if (!user) return;
    try { await api.delete(`/mail/${id}?userId=${user.id}`); setInbox(prev => prev.filter(m => m.id !== id)); }
    catch (err) { console.error(err); }
  };
  const deleteFromSent = async (id) => {
    if (!user) return;
    try { await api.delete(`/mail/${id}?userId=${user.id}`); setSent(prev => prev.filter(m => m.id !== id)); }
    catch (err) { console.error(err); }
  };
  const deleteFromForwarded = async (id) => {
    try { await api.delete(`/forwarded/${id}`); setForwarded(prev => prev.filter(m => m.id !== id)); }
    catch (err) { console.error(err); }
  };

  /* ─── PIN / IMPORTANT ─── */
  const togglePin = async (id) => {
    if (!user) return;
    // Optimistic: flip pinnedBy immediately
    const uid = user.id;
    const flip = (prev) => prev.map(m => {
      if (m.id !== id) return m;
      const pinned = m.pinnedBy || [];
      return enrich({ ...m, pinnedBy: pinned.includes(uid) ? pinned.filter(x => x !== uid) : [...pinned, uid] });
    });
    setInbox(flip);
    setSent(flip);
    try {
      const { data } = await api.post(`/mail/${id}/pin`, { userId: uid });
      const enriched = enrich(data);
      setInbox(prev => prev.map(m => m.id === id ? enriched : m));
      setSent(prev  => prev.map(m => m.id === id ? enriched : m));
    } catch (err) { console.error(err); }
  };

  const toggleImportant = async (id) => {
    if (!user) return;
    // Optimistic: flip importantBy immediately
    const uid = user.id;
    const flip = (prev) => prev.map(m => {
      if (m.id !== id) return m;
      const imp = m.importantBy || [];
      return enrich({ ...m, importantBy: imp.includes(uid) ? imp.filter(x => x !== uid) : [...imp, uid] });
    });
    setInbox(flip);
    setSent(flip);
    try {
      const { data } = await api.post(`/mail/${id}/important`, { userId: uid });
      const enriched = enrich(data);
      setInbox(prev => prev.map(m => m.id === id ? enriched : m));
      setSent(prev  => prev.map(m => m.id === id ? enriched : m));
    } catch (err) { console.error(err); }
  };

  /* ─── MARK READ / UNREAD ─── */
  const markRead = async (id) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    // Optimistic update — mark as read immediately so the UI responds
    // without waiting for the network roundtrip.
    setInbox(prev => prev.map(m =>
      m.id === id
        ? { ...m, unread: false, readBy: [...(m.readBy || []), { id: cu.id, name: cu.name }] }
        : m
    ));
    try {
      const { data } = await api.post(`/mail/${id}/read`, { userId: cu.id, name: cu.name, dept: cu.department });
      // Reconcile with the server's authoritative version
      setInbox(prev => prev.map(m => m.id === id ? enrich(data) : m));
    } catch (err) { console.error(err); }
  };

  const markUnread = async (id) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    // Optimistic update, reconciled with the server response below.
    setInbox(prev => prev.map(m => m.id === id ? { ...m, unread: true } : m));
    try {
      const { data } = await api.post(`/mail/${id}/unread`, { userId: cu.id });
      setInbox(prev => prev.map(m => m.id === id ? enrich(data) : m));
    } catch (err) { console.error(err); }
  };

  /* ─── ACKNOWLEDGE RECEIPT ─── */
  const acknowledgeMail = async (id, signature) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    try {
      const { data } = await api.post(`/mail/${id}/acknowledge`, {
        userId:    cu.id,
        name:      cu.name,
        dept:      cu.department,
        signature,
      });
      const enriched = enrich(data);
      setInbox(prev => prev.map(m => m.id === id ? enriched : m));
      setSent(prev  => prev.map(m => m.id === id ? enriched : m));
      return enriched;
    } catch (err) { console.error("Acknowledge failed:", err); }
  };

  const markAllRead = useCallback(async () => {
    const cu = buildCurrentUser();
    if (!cu) return;
    const unreadMails = inbox.filter(m => m.unread);
    if (unreadMails.length === 0) return;
    try {
      await Promise.all(
        unreadMails.map(m =>
          api.post(`/mail/${m.id}/read`, { userId: cu.id, name: cu.name, dept: cu.department })
        )
      );
      setInbox(prev => prev.map(m => ({ ...m, unread: false })));
    } catch (err) { console.error("markAllRead failed:", err); }
  }, [inbox, buildCurrentUser]);

  const markReadSent = async (id) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    try {
      const { data } = await api.post(`/mail/${id}/read`, { userId: cu.id, name: cu.name, dept: cu.department });
      setSent(prev => prev.map(m => m.id === id ? enrich(data) : m));
    } catch (err) { console.error(err); }
  };

  const markReadForwarded = (id) => {
    setForwarded(prev => prev.map(m => m.id === id ? { ...m, _read: true } : m));
  };

  /* ─── ATTACHMENTS ─── */
  const allAttachments = [
    ...inbox.filter(m => m.attachment).map(m => ({
      id: `inbox-${m.id}`, file: m.attachment,
      name: typeof m.attachment === "string" ? m.attachment : m.attachment?.name || "file",
      source: "received", sender: m.sender, date: m.date, time: m.time, mailTitle: m.title, mailId: m.id,
    })),
    ...sent.filter(m => m.attachment).map(m => ({
      id: `sent-${m.id}`, file: m.attachment,
      name: typeof m.attachment === "string" ? m.attachment : m.attachment?.name || "file",
      source: "sent", sender: "You", date: m.date, time: m.time, mailTitle: m.title, mailId: m.id,
    })),
    ...forwarded.filter(f => f.attachment).map(f => ({
      id: `fwd-${f.id}`, file: f.attachment,
      name: typeof f.attachment === "string" ? f.attachment : f.attachment?.name || "file",
      source: "forwarded", sender: f.sender || f.from?.name, date: f.date, time: f.time, mailTitle: f.title, mailId: f.id,
    })),
  ];

  const currentUser = buildCurrentUser();

  return (
    <AnnouncementContext.Provider value={{
      inbox, sent, forwarded, drafts, loading,
      pinnedIds, importantIds, unreadCount,
      sendMail, saveDraft, deleteDraft, forwardMail,
      deleteFromInbox, deleteFromSent, deleteFromForwarded,
      togglePin, toggleImportant,
      markRead, markUnread, markAllRead, markReadSent, markReadForwarded,
      acknowledgeMail,
      allAttachments, currentUser,
      reload: loadAll,
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error("useAnnouncements must be used inside AnnouncementProvider");
  return ctx;
}
