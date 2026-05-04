import { useState } from "react";

export type User = {
  name: string;
  email: string;
  dob?: { day: string; month: string; year: string };
  joinedISO: string;
};

type StoredUser = User & { password: string };

const STORE_KEY = "ishara_users";
const SESSION_KEY = "ishara_session";

function getStore(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, StoredUser>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string): string | null => {
    const store = getStore();
    const key = email.toLowerCase().trim();
    const found = store[key];
    if (!found) return "No account found with that email.";
    if (found.password !== password) return "Incorrect password.";
    const { password: _p, ...sessionUser } = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return null;
  };

  const register = (
    name: string,
    email: string,
    password: string,
    dob: { day: string; month: string; year: string }
  ): string | null => {
    const store = getStore();
    const key = email.toLowerCase().trim();
    if (store[key]) return "An account with this email already exists.";
    const newUser: StoredUser = {
      name: name.trim(),
      email: key,
      dob,
      joinedISO: new Date().toISOString(),
      password,
    };
    store[key] = newUser;
    saveStore(store);
    const { password: _p, ...sessionUser } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return null;
  };

  const updateProfile = (updates: Partial<Pick<User, "name">>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const store = getStore();
    const key = user.email.toLowerCase();
    if (store[key]) {
      store[key] = { ...store[key], ...updates };
      saveStore(store);
    }
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return { user, login, register, updateProfile, logout };
}
