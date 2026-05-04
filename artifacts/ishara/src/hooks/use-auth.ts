import { useState, useEffect } from "react";

export type User = {
  id: number;
  name: string;
  email: string;
  dob?: { day: string; month: string; year: string };
  joinedISO: string;
};

type ApiUser = {
  id: number;
  email: string;
  username: string;
  dateOfBirth: string | null;
  createdAt: string;
};

const SESSION_CACHE = "ishara_session_v2";

function mapApiUser(u: ApiUser): User {
  let dob: User["dob"] | undefined;
  if (u.dateOfBirth) {
    const [year, month, day] = u.dateOfBirth.split("-");
    dob = {
      day: String(parseInt(day, 10)),
      month: String(parseInt(month, 10)),
      year,
    };
  }
  return {
    id: u.id,
    name: u.username,
    email: u.email,
    dob,
    joinedISO: u.createdAt,
  };
}

function cacheUser(u: User | null) {
  if (u) localStorage.setItem(SESSION_CACHE, JSON.stringify(u));
  else localStorage.removeItem(SESSION_CACHE);
}

function readCache(): User | null {
  try {
    const s = localStorage.getItem(SESSION_CACHE);
    return s ? (JSON.parse(s) as User) : null;
  } catch {
    return null;
  }
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(`${API}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      return {
        status: res.status,
        error: (json as { error?: string }).error ?? "Something went wrong",
      };
    return { status: res.status, data: json as T };
  } catch {
    return { status: 0, error: "Network error — please try again." };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => readCache());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: ApiUser }>("/auth/me")
      .then(({ data, status }) => {
        if (data) {
          const mapped = mapApiUser(data.user);
          cacheUser(mapped);
          setUser(mapped);
        } else if (status === 401) {
          cacheUser(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await apiFetch<{ user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (error) return error;
    if (data) {
      const mapped = mapApiUser(data.user);
      cacheUser(mapped);
      setUser(mapped);
    }
    return null;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    dob: { day: string; month: string; year: string },
  ): Promise<string | null> => {
    const dateOfBirth =
      dob.year && dob.month && dob.day
        ? `${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`
        : undefined;
    const { data, error } = await apiFetch<{ user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username: name, password, dateOfBirth }),
    });
    if (error) return error;
    if (data) {
      const mapped = mapApiUser(data.user);
      cacheUser(mapped);
      setUser(mapped);
    }
    return null;
  };

  const updateProfile = async (updates: Partial<Pick<User, "name">>) => {
    if (!user) return;
    const { data } = await apiFetch<{ user: ApiUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ username: updates.name }),
    });
    if (data) {
      const mapped = mapApiUser(data.user);
      cacheUser(mapped);
      setUser(mapped);
    }
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    cacheUser(null);
    setUser(null);
  };

  return { user, loading, login, register, updateProfile, logout };
}
