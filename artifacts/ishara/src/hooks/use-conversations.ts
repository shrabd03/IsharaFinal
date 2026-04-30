import { useState, useEffect } from "react";

const uuidv4 = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export type ConversationEntry = {
  id: string;
  timestampISO: string;
  text: string;
  signKey: string;
};

export type Conversation = {
  id: string;
  title: string;
  dateISO: string;
  signCount: number;
  entries: ConversationEntry[];
};

const defaultConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Meeting a friend",
    dateISO: new Date(Date.now() - 86400000).toISOString(),
    signCount: 3,
    entries: [
      { id: "e1", timestampISO: new Date(Date.now() - 86400000).toISOString(), text: "Hello! It's good to see you.", signKey: "hello" },
      { id: "e2", timestampISO: new Date(Date.now() - 86300000).toISOString(), text: "Me too.", signKey: "me" },
      { id: "e3", timestampISO: new Date(Date.now() - 86200000).toISOString(), text: "Yes, definitely.", signKey: "yes" },
    ]
  },
  {
    id: "conv-2",
    title: "At the market",
    dateISO: new Date(Date.now() - 172800000).toISOString(),
    signCount: 2,
    entries: [
      { id: "e4", timestampISO: new Date(Date.now() - 172800000).toISOString(), text: "Can you help me?", signKey: "help" },
      { id: "e5", timestampISO: new Date(Date.now() - 172700000).toISOString(), text: "Thank you.", signKey: "thank_you" },
    ]
  }
];

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem("ishara_conversations");
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem("ishara_conversations", JSON.stringify(defaultConversations));
      return defaultConversations;
    } catch {
      return defaultConversations;
    }
  });

  const saveConversations = (newConvs: Conversation[]) => {
    setConversations(newConvs);
    localStorage.setItem("ishara_conversations", JSON.stringify(newConvs));
  };

  const createConversation = (title: string) => {
    const newConv: Conversation = {
      id: uuidv4(),
      title,
      dateISO: new Date().toISOString(),
      signCount: 0,
      entries: [],
    };
    saveConversations([newConv, ...conversations]);
    return newConv;
  };

  const addEntry = (conversationId: string, text: string, signKey: string) => {
    const updated = conversations.map(c => {
      if (c.id === conversationId) {
        const newEntry: ConversationEntry = {
          id: uuidv4(),
          timestampISO: new Date().toISOString(),
          text,
          signKey
        };
        return {
          ...c,
          signCount: c.signCount + 1,
          entries: [...c.entries, newEntry]
        };
      }
      return c;
    });
    saveConversations(updated);
  };

  const deleteConversation = (id: string) => {
    saveConversations(conversations.filter(c => c.id !== id));
  };

  return { conversations, createConversation, addEntry, deleteConversation };
}
