// src/lib/messenger-data.js
// Mock data layer for the Messenger module.
// Replace getConversations / getMessages with real API calls (e.g. src/api/messenger.js)
// when wiring this up to your backend — the shape below is what the UI expects.

export const PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  OFFLINE: "offline",
};

export const currentUser = {
  id: "u-me",
  name: "You",
  avatarUrl: "",
  initials: "ME",
};

export const conversations = [
  {
    id: "c1",
    type: "dm",
    name: "Patricia Reyes",
    role: "HR Manager",
    avatarUrl: "",
    initials: "PR",
    presence: PRESENCE.ONLINE,
    pinned: true,
    unreadCount: 2,
    lastMessageAt: "2026-06-18T09:42:00",
    members: [{ id: "u1", name: "Patricia Reyes", initials: "PR" }],
  },
  {
    id: "c2",
    type: "group",
    name: "Payroll Team",
    role: "5 members",
    avatarUrl: "",
    initials: "PT",
    presence: null,
    pinned: true,
    unreadCount: 0,
    lastMessageAt: "2026-06-18T08:15:00",
    members: [
      { id: "u2", name: "Marco Tan", initials: "MT" },
      { id: "u3", name: "Bea Santos", initials: "BS" },
      { id: "u4", name: "Joel Cruz", initials: "JC" },
    ],
  },
  {
    id: "c3",
    type: "dm",
    name: "Marco Tan",
    role: "Payroll Specialist",
    avatarUrl: "",
    initials: "MT",
    presence: PRESENCE.AWAY,
    pinned: false,
    unreadCount: 0,
    lastMessageAt: "2026-06-17T17:30:00",
    members: [{ id: "u2", name: "Marco Tan", initials: "MT" }],
  },
  {
    id: "c4",
    type: "dm",
    name: "Bea Santos",
    role: "Recruiter",
    avatarUrl: "",
    initials: "BS",
    presence: PRESENCE.OFFLINE,
    pinned: false,
    unreadCount: 5,
    lastMessageAt: "2026-06-17T14:02:00",
    members: [{ id: "u3", name: "Bea Santos", initials: "BS" }],
  },
  {
    id: "c5",
    type: "group",
    name: "Onboarding · Batch 12",
    role: "8 members",
    avatarUrl: "",
    initials: "OB",
    presence: null,
    pinned: false,
    unreadCount: 0,
    lastMessageAt: "2026-06-16T11:00:00",
    members: [
      { id: "u5", name: "Joel Cruz", initials: "JC" },
      { id: "u6", name: "Anna Lim", initials: "AL" },
    ],
  },
  {
    id: "c6",
    type: "dm",
    name: "Joel Cruz",
    role: "IT Support",
    avatarUrl: "",
    initials: "JC",
    presence: PRESENCE.ONLINE,
    pinned: false,
    unreadCount: 0,
    lastMessageAt: "2026-06-15T09:00:00",
    members: [{ id: "u4", name: "Joel Cruz", initials: "JC" }],
  },
];

export const messagesByConversation = {
  c1: [
    {
      id: "m1",
      senderId: "u1",
      senderName: "Patricia Reyes",
      text: "Hi! Just following up on the leave request you filed last week.",
      sentAt: "2026-06-18T09:30:00",
      status: "read",
    },
    {
      id: "m2",
      senderId: "u1",
      senderName: "Patricia Reyes",
      text: "It's approved on my end — payroll will reflect it next cycle.",
      sentAt: "2026-06-18T09:31:00",
      status: "read",
    },
    {
      id: "m3",
      senderId: "u-me",
      senderName: "You",
      text: "That's great, thank you for the quick turnaround!",
      sentAt: "2026-06-18T09:35:00",
      status: "read",
    },
    {
      id: "m4",
      senderId: "u1",
      senderName: "Patricia Reyes",
      text: "Of course. One more thing — can you update your emergency contact in the portal? It's still showing last year's info.",
      sentAt: "2026-06-18T09:42:00",
      status: "delivered",
    },
  ],
  c2: [
    {
      id: "m5",
      senderId: "u2",
      senderName: "Marco Tan",
      text: "Cutoff for June 30 payroll adjustments is this Friday EOD.",
      sentAt: "2026-06-18T08:10:00",
      status: "read",
    },
    {
      id: "m6",
      senderId: "u3",
      senderName: "Bea Santos",
      text: "Noted, will submit the new hire batch by Thursday.",
      sentAt: "2026-06-18T08:15:00",
      status: "read",
    },
  ],
  c3: [
    {
      id: "m7",
      senderId: "u2",
      senderName: "Marco Tan",
      text: "Your reimbursement was processed, should hit by Monday.",
      sentAt: "2026-06-17T17:30:00",
      status: "read",
    },
  ],
  c4: [
    {
      id: "m8",
      senderId: "u3",
      senderName: "Bea Santos",
      text: "We'd like to move your interview with the design candidate to Thursday 2PM, does that work?",
      sentAt: "2026-06-17T14:02:00",
      status: "delivered",
    },
  ],
  c5: [
    {
      id: "m9",
      senderId: "u5",
      senderName: "Joel Cruz",
      text: "Laptops for the new batch are imaged and ready for pickup.",
      sentAt: "2026-06-16T11:00:00",
      status: "read",
    },
  ],
  c6: [
    {
      id: "m10",
      senderId: "u4",
      senderName: "Joel Cruz",
      text: "Your VPN access has been restored, try logging in again.",
      sentAt: "2026-06-15T09:00:00",
      status: "read",
    },
  ],
};

export function getConversations() {
  return [...conversations].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });
}

export function getMessages(conversationId) {
  return messagesByConversation[conversationId] ?? [];
}

export function getConversationPreview(conversationId) {
  const msgs = messagesByConversation[conversationId] ?? [];
  return msgs[msgs.length - 1]?.text ?? "";
}