import { useState, useEffect } from "react";

export type User = {
  name: string;
  email: string;
  joinedISO: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("ishara_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (name: string, email: string) => {
    const newUser = { name, email, joinedISO: new Date().toISOString() };
    localStorage.setItem("ishara_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("ishara_user");
    setUser(null);
  };

  return { user, login, logout };
}
