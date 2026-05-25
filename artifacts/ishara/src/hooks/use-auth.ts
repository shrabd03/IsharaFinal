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
const TOKEN_KEY = "ishara_token";                        // ← NEW

function mapApiUser(u?: ApiUser): User {
  if (!u) {
    return { id: 0, name: "", email: "", dob: undefined, joinedISO: "" };
  }
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

// ← NEW: token helpers
function saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }
function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "") + "/api";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    // ← NEW: attach token as Authorization header if available
    const token = getToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,                                   // ← NEW
      },
      ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      return {
        status: res.status,
        error: (json as { error?: string; detail?: string }).error
          ?? (json as { detail?: string }).detail        // ← NEW: handle FastAPI error format
          ?? "Something went wrong",
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
        if (data?.user) {
          const mapped = mapApiUser(data.user);
          cacheUser(mapped);
          setUser(mapped);
        } else if (status === 401) {
          cacheUser(null);
          clearToken();                                  // ← NEW
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await apiFetch<{ user: ApiUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (error) return error;

    if (data?.token) saveToken(data.token);              // ← NEW
    if (data?.user) {
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

    const { data, error } = await apiFetch<{ user: ApiUser; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username: name, password, dateOfBirth }),
    });

    if (error) return error;

    if (data?.token) saveToken(data.token);              // ← NEW
    if (data?.user) {
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
    if (data?.user) {
      const mapped = mapApiUser(data.user);
      cacheUser(mapped);
      setUser(mapped);
    }
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    cacheUser(null);
    clearToken();                                        // ← NEW
    setUser(null);
  };

  return { user, loading, login, register, updateProfile, logout };
}