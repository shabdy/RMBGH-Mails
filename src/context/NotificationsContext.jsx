import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../services/apiClient";
import { AuthContext } from "./authContext";

const NotificationsContext = createContext(null);

const POLL_MS = 20000;

// Feed-wide activity notifications — new posts/events, comments, replies,
// reactions, and pins. Polled on an interval (no websocket in this stack)
// so the bell stays reasonably fresh without the user refreshing.
export function NotificationsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    if (!user?.id) return;
    pollRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [load, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Mark notification read failed:", err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.post("/notifications/read-all");
    } catch (err) {
      console.error("Mark all notifications read failed:", err);
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, reload: load }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
