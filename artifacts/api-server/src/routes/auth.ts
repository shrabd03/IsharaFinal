import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const JWT_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";
const COOKIE_NAME = "ishara_token";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

interface JwtPayload {
  userId: number;
}

function signToken(userId: number): string {
  return jwt.sign({ userId } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function getUserIdFromCookie(req: Request): number | null {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload.userId;
  } catch {
    return null;
  }
}

function safeUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    dateOfBirth: u.dateOfBirth ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, username, password, dateOfBirth } = req.body as {
    email?: string;
    username?: string;
    password?: string;
    dateOfBirth?: string;
  };

  if (!email || !username || !password) {
    res.status(422).json({ error: "email, username and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(422).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const key = email.toLowerCase().trim();

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, key))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [created] = await db
    .insert(usersTable)
    .values({
      email: key,
      username: username.trim(),
      passwordHash,
      dateOfBirth: dateOfBirth ?? null,
    })
    .returning();

  const token = signToken(created.id);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.status(201).json({ user: safeUser(created) });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(422).json({ error: "email and password are required" });
    return;
  }

  const key = email.toLowerCase().trim();

  const [found] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, key))
    .limit(1);

  if (!found) {
    res.status(401).json({ error: "No account found with that email." });
    return;
  }

  const valid = await bcrypt.compare(password, found.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  const token = signToken(found.id);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.json({ user: safeUser(found) });
});

router.post("/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [found] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!found) {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({ user: safeUser(found) });
});

router.patch("/auth/me", async (req: Request, res: Response) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { username } = req.body as { username?: string };
  if (!username || !username.trim()) {
    res.status(422).json({ error: "username is required" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ username: username.trim() })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user: safeUser(updated) });
});

export default router;
