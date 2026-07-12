// src/lib/messenger-time.js
// Small, dependency-free time helpers for chat timestamps.
// Swap for date-fns/dayjs if your project already depends on one.

export function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24 && isSameDay(date, now)) return `${diffHr}h`;
  if (diffDay === 1 || (!isSameDay(date, now) && diffDay === 0)) return "Yesterday";
  if (diffDay < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatClockTime(isoString) {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDayDivider(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  if (isSameDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Decide whether two consecutive messages should visually group
// (same sender, within 3 minutes of each other).
export function shouldGroupWithPrevious(current, previous) {
  if (!previous) return false;
  if (current.senderId !== previous.senderId) return false;
  const gapMs = new Date(current.sentAt) - new Date(previous.sentAt);
  return gapMs < 3 * 60 * 1000;
}