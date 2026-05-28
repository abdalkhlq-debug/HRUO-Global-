import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  userId?: number;
  tenantId?: number;
  userRole?: string;
  isSuperAdmin?: boolean;
  userEmail?: string;
}

const SUPER_ADMIN_EMAILS = [
  "info@hruo.net",
  "admin@hruo.net",
  "abd.elkhaleq@outlook.com",
];

// Simple token store (in-memory for now — replace with Redis/JWT in production)
const sessions = new Map<string, { userId: number; email: string; tenantId: number | null; role: string; isSuperAdmin: boolean }>();

export function createSession(userId: number, email: string, tenantId: number | null, role: string): string {
  const token = `hruo_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessions.set(token, { userId, email, tenantId: tenantId ?? null, role, isSuperAdmin: SUPER_ADMIN_EMAILS.includes(email) });
  return token;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const session = sessions.get(token);
  if (!session) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  req.userId = session.userId;
  req.tenantId = session.tenantId ?? undefined;
  req.userRole = session.role;
  req.isSuperAdmin = session.isSuperAdmin;
  req.userEmail = session.email;
  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.isSuperAdmin) {
      res.status(403).json({ error: "Forbidden: Super admin only" });
      return;
    }
    next();
  });
}

export { SUPER_ADMIN_EMAILS };
