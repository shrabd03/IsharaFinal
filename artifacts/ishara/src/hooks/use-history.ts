import { useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

export type HistoryEntry = {
  id: string;
  type: "sign-to-text" | "text-to-sign";
  text: string;
  words: string[];
  timestamp: number;
  userEmail: string;
};

const STORAGE_KEY = "ishara_history";
const MAX_ENTRIES = 100;

function loadAll(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function useHistory() {
  const { user } = useAuth();

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp" | "userEmail">) => {
      if (!user) return;
      const all = loadAll();
      const newEntry: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
        userEmail: user.email,
      };
      saveAll([newEntry, ...all]);
    },
    [user]
  );

  const getEntries = useCallback((): HistoryEntry[] => {
    if (!user) return [];
    return loadAll().filter((e) => e.userEmail === user.email);
  }, [user]);

  const deleteEntry = useCallback((id: string) => {
    saveAll(loadAll().filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (!user) return;
    saveAll(loadAll().filter((e) => e.userEmail !== user.email));
  }, [user]);

  return { addEntry, getEntries, deleteEntry, clearAll };
}
