// src/hooks/useMessenger.js
import { useCallback, useMemo, useState } from "react";
import {
  currentUser,
  getConversations,
  getMessages,
} from "@/lib/messenger-data";

export function useMessenger() {
  const [conversations] = useState(getConversations());
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? null);
  const [messagesByConv, setMessagesByConv] = useState(() => {
    const map = {};
    conversations.forEach((c) => {
      map[c.id] = getMessages(c.id);
    });
    return map;
  });
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const activeMessages = messagesByConv[activeId] ?? [];

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed || !activeId) return;

      const newMessage = {
        id: `m-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: trimmed,
        sentAt: new Date().toISOString(),
        status: "sent",
      };

      setMessagesByConv((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), newMessage],
      }));
      setDraft("");

      // Simulate a reply for demo purposes — remove when wiring real backend.
      simulateReply(activeId, setMessagesByConv, setPeerTyping, activeConversation);
    },
    [activeId, activeConversation]
  );

  return {
    conversations: filteredConversations,
    activeConversation,
    activeMessages,
    draft,
    setDraft,
    search,
    setSearch,
    selectConversation,
    sendMessage,
    peerTyping,
    currentUser,
  };
}

function simulateReply(convId, setMessagesByConv, setPeerTyping, conversation) {
  if (!conversation || conversation.type === "group") return;
  setPeerTyping(true);
  const delay = 1200 + Math.random() * 1200;
  setTimeout(() => {
    setPeerTyping(false);
    setMessagesByConv((prev) => ({
      ...prev,
      [convId]: [
        ...(prev[convId] ?? []),
        {
          id: `m-${Date.now()}-r`,
          senderId: conversation.members?.[0]?.id ?? "peer",
          senderName: conversation.name,
          text: "Got it, thanks for the update!",
          sentAt: new Date().toISOString(),
          status: "delivered",
        },
      ],
    }));
  }, delay);
}